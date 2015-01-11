$(function () {
    // initiate slider
    $("#slider").slider();
    // start time
    $('#start').datetimepicker({
        pickDate: false,
        pickSeconds: false
    });
    // end time
    $('#finish').datetimepicker({
        pickDate: false,
        pickSeconds: false
    });

    // time properties object
    time_properties = {
        start_hours: '08',
        start_min: '00',
        end_hours: '18',
        end_min: '15',
        morning_toil: 0,
        flexi: '',
        afternoon_toil: 0,
        has_morning_toil: false,
        has_afternoon_toil: false
    };

    $('#calculateTime').click(function () {

        // reset values
        time_properties.flexi = '';
        time_properties.afternoon_toil = 0;
        time_properties.morning_toil = 0;
        $('#error,#results').hide();

        // get start time and break down the values
        var start = $('#start_val').val();
        var start_split = start.split(':');
        var start_hours = start_split[0];
        var start_min = start_split[1];

        // get end time and break down the values
        var end = $('#end_val').val();
        var end_split = end.split(':');
        var end_hours = end_split[0];
        var end_min = end_split[1];

        // has the user completed both forms?
        if (start === '' || end === '') {
            $('#error').show();
            return;
        }

        // calculate if the start time is before 08:00
        if ((start_hours + '.' + start_min) < time_properties.start_hours + '.' + time_properties.start_min) {
            calculate_time.morning_toil(start_hours, start_min);
            time_properties.has_morning_toil = true;
        } else {
            time_properties.has_morning_toil = false;
        }

        // calculate if the end time is after 18:15
        if ((end_hours + '.' + end_min) > time_properties.end_hours + '.' + time_properties.end_min) {
            calculate_time.afternoon_toil(end_hours, end_min);
            time_properties.has_afternoon_toil = true;
        } else {
            time_properties.has_afternoon_toil = false;
        }

        // calculate the flexi
        calculate_time.flexi(start_hours, start_min, end_hours, end_min);

        var total_hours = calculate_time.total_hours();

        $('#results').show();
    });

    // calculate time functions
    calculate_time = {
        morning_toil: function (hours, min) {
            time = calculate_time.time_difference(hours, min, time_properties.start_hours, time_properties.start_min, 'morning');
            // before core hours - time and a half
            time = time * 1.5;
            time_properties.morning_toil = time;
        },
        flexi: function (start_hours, start_min, end_hours, end_min) {

            if (time_properties.has_morning_toil) {
                start_hours = time_properties.start_hours;
                start_min = time_properties.start_min;
            }
            if (time_properties.has_afternoon_toil) {
                end_hours = time_properties.end_hours;
                end_min = time_properties.end_min;
            }

            time = calculate_time.time_difference(start_hours, start_min, end_hours, end_min, 'morning');
            lunch = $('#lunch').val() * 60000;
            // console.log(time + ' ' + lunch)
            time_properties.flexi = time - lunch;
        },
        afternoon_toil: function (hours, min) {
            time = calculate_time.time_difference(hours, min, time_properties.end_hours, time_properties.end_min, 'afternoon');
            // after core hours - time and a half
            time = time * 1.5;
            time_properties.afternoon_toil = time;
        },
        time_difference: function (start_hours, start_min, end_hours, end_min, type) {
            var date1 = new Date(2000, 0, 1, start_hours, start_min);
            var date2 = new Date(2000, 0, 1, end_hours, end_min);

            if (type === 'morning') {
                diff = date2 - date1;
            } else {
                diff = date1 - date2;
            }

            return diff;
        },
        time_format: function (diff) {
            var msec = diff;
            var hh = Math.floor(msec / 1000 / 60 / 60);
            msec -= hh * 1000 * 60 * 60;
            var mm = Math.floor(msec / 1000 / 60);
            msec -= mm * 1000 * 60;
            var ss = Math.floor(msec / 1000);
            msec -= ss * 1000;

            if (mm.toString().length === 1) {
                mm = '0' + mm;
            }

            return hh + ':' + mm;
        },
        time_to_decimal: function (time) {
            var hoursMinutes = time.split(/[.:]/);
            var hours = parseInt(hoursMinutes[0], 10);
            var minutes = hoursMinutes[1] ? parseInt(hoursMinutes[1], 10) : 0;
            decimal_val = hours + minutes / 60;

            return decimal_val.toFixed(2);
        },
        total_hours: function () {

            total = time_properties.morning_toil + time_properties.flexi + time_properties.afternoon_toil;

            calculate_hours = calculate_time.time_format(total);
            $('#flexi-standard').html('Flexi ' + calculate_hours + ' hours');
            $('#toil-standard').html('Toil 0 hours');
            $('#flexi-decimal').html('Flexi ' + calculate_time.time_to_decimal(calculate_hours) + ' hours');
            $('#toil-decimal').html('Toil 0 hours');

            mins = total / 60000;

            $('#total').html('<strong>Total hours: </strong>' + calculate_time.time_format(total));

            $("#slider").slider({
                range: "min",
                value: 0,
                min: 0,
                max: total / 60000,
                //this gets a live reading of the value and prints it on the page
                slide: function (event, ui) {

                    var flexiPerct = mins - ui.value;
                    var toilPerct = ui.value;

                    flexiPerct = flexiPerct * 60000;
                    toilPerct = toilPerct * 60000;

                    calculatedFlexi = calculate_time.time_format(flexiPerct);
                    calculatedToil = calculate_time.time_format(toilPerct);

                    $('#flexi-standard').html('Flexi ' + calculatedFlexi + ' hours');
                    $('#toil-standard').html('Toil ' + calculatedToil + ' hours');

                    $('#flexi-decimal').html('Flexi ' + calculate_time.time_to_decimal(calculatedFlexi) + ' hours');
                    $('#toil-decimal').html('Toil ' + calculate_time.time_to_decimal(calculatedToil) + ' hours');
                }
            });
        }
    };

});
