function displayAppointment(date_time, area, luminosity, humidity, water) {
    let $appointment = $('#mold').clone();
    $appointment.css('display', '');
    var date = new Date(date_time);
    var day = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    
    $appointment.find('#date_time').text(day);
    $appointment.find('#area').text(area);
    $appointment.find('#luminosity').text(luminosity);
    $appointment.find('#humidity').text(humidity);
    $appointment.find('#water').text(water);
    $('#appointments tbody').append($appointment);
};

$(document).ready(function() {

    $.ajax({
        url: 'http://localhost:3000/history/get',
        type: 'get',
        dataType: 'json',
        data: {},
        success: function(results) {
            console.log(results);
            results.forEach(item => {
                displayAppointment(item.date_time, item.area, item.luminosity, item.humidity, item.water);
            });
        }
    })
});