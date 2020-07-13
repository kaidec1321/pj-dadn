fetchMostRecentData()
function fetchMostRecentData() {
	fetch("/data")
	.then(response => response.json())
	.then(data => updateView(data));
}

function updateView(data) {
	var temp = document.getElementById("temp");
	var humi = document.getElementById("humi")
	temp.innerHTML = data[0]
	humi.innerHTML = data[1]
}

function showError(err) {
	alert(err)
}
setInterval(fetchMostRecentData, 5000)