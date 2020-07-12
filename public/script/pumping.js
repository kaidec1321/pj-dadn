var slider = document.getElementById("myRange");
var output = document.getElementById("rangeVal");
output.innerHTML = slider.value;
// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  output.innerHTML = this.value;
}

$(document).ready(function() {
    var submitActor = null;
    var $form = $('#my-form');
    var $submitActors = $form.find('input[type=submit]');
    $('#my-form').submit(function() {
        if (!$('#area1').prop('checked') && !$('#area2').prop('checked') && !$('#area3').prop('checked') && !$('#area4').prop('checked')) {
            alert("Bạn chưa chọn khu vực thực hiện!");
            return false;
        }
        if (submitActor.value === "BƠM NƯỚC NGAY") {
            let time = $('#time').val();
            time = parseInt(time);
            if (isNaN(time)) {
                alert("Bạn chưa nhập số phút!");
                return false;
            }
        }
        return true;
    });

    $submitActors.click(function(event) {
        submitActor = this;
    });

});