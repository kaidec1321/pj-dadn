
(function ($) {
    "use strict";
    
})(jQuery);

function displayAppointment(hour, area, light, humidity, amount) {
    let $appointment = $('#mold').clone();
    $appointment.css('display', '');
    $appointment.find('#hour').text(hour);
    $appointment.find('#area').text(area);
    $appointment.find('#light').text(light);
    $appointment.find('#humidity').text(humidity);
    $appointment.find('#amount').text(amount);
    $appointment.find('#remove').click(function() {
        if ($focusAppointment === $appointment) {
            toggleForm();
            $focusAppointment = null;
        }
    });