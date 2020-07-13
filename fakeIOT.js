var mqtt =  require('mqtt');
var iot = mqtt.connect('http://localhost:1883');

let temp = 23
var time = setInterval(sendData, 10000)
function sendData() {
    if (temp > 30) {temp = temp - 10; }
    temp = temp + 2
    message = JSON.stringify([{"device_id":"TempHumi","values":[temp.toString(),"15"]}]);
    console.log(message.toString())
    iot.publish('Topic/TempHumi', message);
}
sendData()