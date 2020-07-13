var temp = document.getElementById("temp")
var humi = document.getElementById("humi")

$(document).ready(function() {
	var refresher = setInterval(update_content(), 10000);
})
function update_content() {
	$.ajax({
		url: "temphumi.html",
		cache: false,
		success: success
	})
	var newDoc = document
}