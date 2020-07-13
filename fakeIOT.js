var mqtt =  require('mqtt');
var iot = mqtt.connect('http://localhost:1883');

let temp = 0
var time = setInterval(sendData, 10000)
function sendData() {
    temp = temp + 1
    message = JSON.stringify([{"device_id":"TempHumi","values":[temp.toString(),"72"]}]);
    console.log(message.toString())
    iot.publish('Topic/TempHumi', message);
}
sendData()