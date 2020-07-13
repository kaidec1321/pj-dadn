var slider = document.getElementById("myRange");
var output = document.getElementById("rangeVal");
output.innerHTML = slider.value;
// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  output.innerHTML = this.value;
}

function sendReq(data) {
    $.ajax({
        url: 'http://localhost:3000/pumping/submit-form',
        type: 'post',
        dataType: 'text',
        data: data,
        success: function(result) {
            $.notify('<strong>Thành công!</strong> Kích hoạt máy bơm khu vực ' + data.area, {
                type: 'success'
            });
        }
    });
}

$(document).ready(function() {
    var submitActor = null;
    var $form = $('#my-form');
    var $submitActors = $form.find('input[type=submit]');
    $form.submit(function(event) {
        event.preventDefault();
    });
    $('#startbtn').click(function() {
        let time = $('#time').val();
        if (time == null || time == "") {
            $.notify('<strong>Lỗi!</strong> Bạn chưa nhập thời gian bơm.', {
                type: 'danger'
            });
            this.disabled = false;
            return;
        }
        var checked = $('input[type="checkbox"]:checked');
        if (checked.length == 0) {
            $.notify('<strong>Lỗi!</strong> Bạn chưa chọn khu vực thực hiện.', {
                type: 'danger'
            });
            this.disabled = false;
            return;
        }
        checked.each(function() {
            let area = $(this).val();
            let data = {
                minutes: time,
                intensity: $("#myRange").val(),
                area: area,
                type: "start"
            };
            $.ajax({
                url: 'http://localhost:3000/pumping/submit-form',
                type: 'post',
                dataType: 'text',
                data: data,
                success: function(result) {
                    if (result == "success") {
                        $.notify('<strong>Thành công!</strong> Kích hoạt máy bơm khu vực ' + area, {
                            type: 'success'
                        });
                    }
                    else {
                        $.notify('<strong>Bận!</strong> Máy bơm khu vực ' + area + ' đang hoạt động', {
                            type: 'danger'
                        });
                        setTimeout(() => {
                            if (confirm("Máy bơm đang hoạt động! Bạn vẫn muốn tiếp tục kích hoạt?")) {
                            data.type = "force";
                            sendReq(data);
                            }
                        }, 1000);    
                    }
                }
            });
        });
        this.disabled = false;
    });

    $('#stopbtn').click(function() {
        var checked = $('input[type="checkbox"]:checked');
        if (checked.length == 0) {
            $.notify('<strong>Lỗi!</strong> Bạn chưa chọn khu vực thực hiện.', {
                type: 'danger'
            });
            this.disabled = false;
            return;
        }
        checked.each(function() {
            let area = $(this).val();
            $.ajax({
                url: 'http://localhost:3000/pumping/submit-form',
                type: 'post',
                dataType: 'text',
                data: {
                    area: area,
                    type: "stop"
                },
                success: function(result) {
                    if (result == "success") {
                        var notify = $.notify('<strong>Thành công!</strong> Dừng máy bơm khu vực ' + area, {
                            type: 'success'
                        });
                    }
                    else {
                        var notify = $.notify('<strong>Không thực hiện!</strong> Máy bơm hiện không hoạt động!');
                    }
                }
            })
        });
        this.disabled = false;
    });


    $submitActors.click(function(event) {
        submitActor = this;
    });

});