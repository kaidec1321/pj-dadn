let $focusAppointment = null;

function toggleForm() {
    $('#add').toggle();
    $('#form').toggle();
    $('#add').parent().toggleClass("col-xs-2 col-sm-2 col-md-2 col-lg-2");
    $('#add').parent().toggleClass("col-xs-3 col-sm-3 col-md-3 col-lg-3");
    $('#schedule').toggleClass("col-xs-10 col-sm-10 col-md-10 col-lg-10");
    $('#schedule').toggleClass("col-xs-9 col-sm-9 col-md-9 col-lg-9");
    if ($focusAppointment !== null) {
        $('#checkbox').css('display', 'none');
        $('#radio').css('display', '');
        $('#select-day option:last-child').css('display', 'none');
        $('#form #title strong').text('Chỉnh sửa cuộc hẹn');
    } else {
        $('#checkbox').css('display', '');
        $('#radio').css('display', 'none');
        $('#select-day option:last-child').css('display', '');
        $('#form #title strong').text('Thêm cuộc hẹn');
    }
};

function updateForm() {
    if ($focusAppointment !== null) {
        let area = $focusAppointment.find('#area').text();
        $('#radio .radio-inline:nth-child(' + area + ') input').prop('checked', 'true');
        $('#select-day').val($focusAppointment.find('#day').text());
        $('#text-hour').val($focusAppointment.find('#hour').text());
        $('#text-minute').val($focusAppointment.find('#minute').text());
    }
}

function eraseForm() {
    $('#checkbox-area').children().children().each(function() {
        $(this).prop('checked', false);
    });
    $('#checkbox-area .checkbox-inline:first-child input').prop('checked', 'true');
    $('#select-day').val('Thứ hai');
    $('#text-hour').val(0);
    $('#text-minute').val(0);
};

function displayAppointment(area, day, hour, minute) {
    let $appointment = $('#mold').clone();
    $appointment.css('display', '');
    $appointment.find('#area').text(area);
    $appointment.find('#day').text(day);
    $appointment.find('#hour').text(hour);
    $appointment.find('#minute').text(minute);
    $appointment.find('#remove').click(function() {
        if ($focusAppointment === $appointment) {
            toggleForm();
            $focusAppointment = null;
        }
        if (confirm("Bạn có thực sự muốn xóa?")) {
            $.ajax({
                url: 'http://localhost:3000/scheduling/delete',
                type: 'post',
                dataType: 'text',
                data: {
                    area: area,
                    day: day,
                    hour: hour,
                    minute: minute
                },
                success: function(result) {
                    $appointment.remove();
                }
            })
        }

    });
    $appointment.find('#edit').click(function() {

        if ($focusAppointment === null) {

            $(this).css('background-color', 'gray');
            $focusAppointment = $appointment;
            toggleForm();
        } else {
            $focusAppointment.find('#edit').css('background-color', '');
            $(this).css('background-color', 'gray');
            $focusAppointment = $appointment;
        }
        updateForm();
    });
    $('#appointments tbody').append($appointment);
};

function createAppointment(area, day, hour, minute) {
    $.ajax({
        url: 'http://localhost:3000/scheduling/post',
        type: "post",
        dataType: "text",
        data: {
            area: area,
            day: day,
            hour: hour,
            minute: minute,
        },
        success: function(result) {
            console.log(result);
            if (result === 'success') {
                displayAppointment(area, day, hour, minute);
            }
        }
    })

};

function updateAppointment(area, day, hour, minute) {
    let oldArea = $focusAppointment.find('#area').text();
    let oldDay = $focusAppointment.find('#day').text();
    let oldHour = $focusAppointment.find('#hour').text();
    let oldMinute = $focusAppointment.find('#minute').text();
    $.ajax({
        url: 'http://localhost:3000/scheduling/put',
        type: 'post',
        dataType: 'text',
        data: {
            oldArea: oldArea,
            oldDay: oldDay,
            oldHour: oldHour,
            oldMinute: oldMinute,

            area: area,
            day: day,
            hour: hour,
            minute: minute,
        },
        success: function(result) {
            console.log(result);
            if (result == 'success') {
                $focusAppointment.find('#area').text(area);
                $focusAppointment.find('#day').text(day);
                $focusAppointment.find('#hour').text(hour);
                $focusAppointment.find('#minute').text(minute);
                $focusAppointment = null;
            } else {
                $focusAppointment.remove();
                $focusAppointment = null;
            }

        }
    }).then((result) => {
        sortAppointments();
    })

}

function sortAppointments() {
    $('#appointments tr').sort(function(a, b) {
        let areaA = parseInt($(a).find('#area').text());
        let areaB = parseInt($(b).find('#area').text());
        if (areaA !== areaB) {
            return areaA - areaB;
        }
        let dayA = $(a).find('#day').text();
        let dayB = $(b).find('#day').text();
        days = {
            "Thứ hai": 2,
            "Thứ ba": 3,
            "Thứ tư": 4,
            "Thứ năm": 5,
            "Thứ sáu": 6,
            "tThứ bảy": 7,
            "Chủ nhật": 8
        };
        if (days[dayA] !== days[dayB]) {
            return days[dayA] - days[dayB];
        }
        let hourA = parseInt($(a).find('#hour').text());
        let hourB = parseInt($(b).find('#hour').text());
        if (hourA !== hourB) {
            return hourA - hourB;
        }
        let minuteA = parseInt($(a).find('#minute').text());
        let minuteB = parseInt($(b).find('#minute').text());
        return minuteA - minuteB;
    }).appendTo('#appointments tbody');
}

$(document).ready(function() {
    $.ajax({
        url: 'http://localhost:3000/scheduling/get',
        type: 'get',
        dataType: 'json',
        data: {},
        success: function(results) {
            results.forEach(item => {
                displayAppointment(item.area, item.day, item.hour, item.minute);
            });
            sortAppointments();
        }

    })

    $('#add').click(function() {
        toggleForm();
        eraseForm();
    });

    $('#close-form').click(function() {
        $focusAppointment.find('#edit').css('background-color', '');
        $focusAppointment = null;
        eraseForm();
        toggleForm();
    });

    $('#done-form').click(function() {
        let day = $('#select-day').val();
        let rawHour = $('#text-hour').val();
        let rawMinute = $('#text-minute').val();
        hour = parseInt(rawHour);
        minute = parseInt(rawMinute);
        if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59 || hour.toString() !== rawHour || minute.toString() !== rawMinute) {
            eraseForm();
            toggleForm();
            alert("Dữ liệu bạn nhập không đúng!");
            return;
        }
        if ($focusAppointment !== null) {
            $focusAppointment.find('#edit').css('background-color', '');
            let area = $('#radio-area input:checked').val();
            updateAppointment(area, day, hour, minute);
        } else {
            let areas = [];
            let flag = true;
            $('#checkbox-area input:checked').each(function(index) {
                let area = $(this).val();
                if (area === "Tất") {
                    areas = ['1', '2', '3', '4'];
                    flag = false;
                } else {
                    if (flag) {
                        areas.push($(this).val());
                    }
                }

            });
            if (day === "Tất cả") {
                days = ['Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy', 'Chủ nhật'];
            } else {
                days = [day];
            }
            areas.forEach(area => {
                days.forEach(day => {
                    createAppointment(area, day, hour, minute);
                })
            });
            sortAppointments();



        }

        eraseForm();
        toggleForm();

    });

    $('#erase-form').click(function() {
        eraseForm();
    });



});