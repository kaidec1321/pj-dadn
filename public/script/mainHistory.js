function loadHistory() {
    var date = new Date($('#date-input').val());
        day = date.getDate();
        month = date.getMonth() + 1;
        year = date.getFullYear();

    $.ajax({
        url: 'http://localhost:3000/history/get',
        type: 'post',
        dataType: 'json',
        data: {day: day, month: month, year: year},
        
        success: function(results) {   
            $("#appointments").find("tr:gt(1)").remove();
            results.forEach(item => {
                // alert(item.date_time);
                displayAppointment(item.date_time, item.area, item.luminosity, item.humidity, item.water);
            });
        }
    })
}

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
    $('#tbodyid').append($appointment);
    
};

$(document).ready(function() {
    document.getElementById("date-input").valueAsDate = new Date();
    alert($("#date-input").val());
    loadHistory();
});



  