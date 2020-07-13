// var slider = document.getElementById("myRange");
// var output = document.getElementById("rangeVal");
// output.innerHTML = slider.value;
// Update the current slider value (each time you drag the slider handle)
// slider.oninput = function() {
//   output.innerHTML = this.value;
// }

$(document).ready(function() {
    var submitActor = null;
    var $form = $('#my-form');
    var $submitActors = $form.find('input[type=submit]');
    $('#my-form').submit(function() {
        // if (!$('#username').prop('checked') && !$('#password').prop('checked')) {
        //     alert("Hãy nhập đầy đủ thông tin!");
        //     return false;
        // }
        if (submitActor.value == "Đăng nhập") {
            let username = document.forms["my-form"]["username"].value;
            let password = document.forms["my-form"]["password"].value;
            if (username == "") {
                alert("Bạn chưa nhập tên đăng nhập!");
                return false;
            }
            if (password == ""){
                alert("Bạn chưa nhập mật khẩu!");
                return false;
            }
        }
        return true;
    });

    $submitActors.click(function(event) {
        submitActor = this;
    });
});