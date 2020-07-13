var mqtt =  require('mqtt');
var iot = mqtt.connect('http://localhost:1883');

var time = setInterval(sendData, 5000)
function sendData() {
    message = JSON.stringify([{"device_id":"TempHumi","values":["25","72"]}]);
    console.log(message.toString())
    iot.publish('Topic/TempHumi', message);
}