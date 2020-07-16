// var slider = document.getElementById("myRange");
// var output = document.getElementById("rangeVal");
// output.innerHTML = slider.value;
// Update the current slider value (each time you drag the slider handle)
// slider.oninput = function() {
//   output.innerHTML = this.value;
// }

function check(event) {
    if ($('#user').val() == "" || $('#password').val() == "") {
        alert("Vui lòng điền đầy đủ các trường!");
        event.preventDefault();
    }
}