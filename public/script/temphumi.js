var socket = io.connect('http://localhost:8000');
var document = Document;
socket.on('connect', function (data) {
	console.log("hello");
	socket.emit('join', 'Hello server from client');
});
socket.on('message', function(data) {
	// socket.emit('message',data.toString());
	// socket.emit('message', data);
	// $('#thread').append('<li>' + data + '</li>');
	var temp = document.getElementById("temp");
	temp.innerHTML = data[0];
	var humi = document.getElementById("humi");
	humi.innerHTML = data[1];
	// socket.emit('message', temp);
})
$('#update').submit(function() {
	socket.emit('message','client request');
	socket.emit('action', '');
	this.reset();
	return false;
});
var time = setInterval(myTimer, 10000);

function myTimer() {
	socket.emit('action','');
}