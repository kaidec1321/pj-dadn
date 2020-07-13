var mqtt = require('mqtt');
var pumpState = false;
var humidity = 0;
var temperature = 0;
var task = null;

var publisher = mqtt.connect('http://localhost:1883');
var tempHumiListener = mqtt.connect('http://localhost:1883')
var pumpListener = mqtt.connect('http://localhost:1883');

pumpListener.subscribe('Topic/Speaker');
pumpListener.on('message', function(topic, message) {
    var status = JSON.parse(message.toString());
    console.log(status);
    try {
        var currentState = Number(status[0].values[0]);
        if (currentState == "0") {
            pumpState = false;
        } else pumpState = true;
    } catch {
        console.log("REJECTED - Wrong data format!")
    }   
});

tempHumiListener.subscribe("Topic/TempHumi")
tempHumiListener.on('message', function(topic, message) {
    var status = JSON.parse(message.toString());
    console.log(status);
    try {
        temperature = Number(status[0].values[0]);
        humidity = Number(status[0].values[1]); 
        //Check humidity, temperature and auto-pump if the conditions - decided by the team, are satisfied  
        if (humidity < 20 && temperature > 30) {
            console.log('Temperature: ' + status[0].values[0] + ' - Humidity: ' + status[0].values[1] + ' - AUTO START MOTOR');
            var message = JSON.stringify([{device_id: 'Speaker', values: ['1', '150']}]);
            publisher.publish('Topic/Speaker', message);
            console.log("Message: " + message + " auto sent to Topic/Speaker");
        }
    }
    catch {
        console.log("REJECTED - Wrong data format!")
    }
});

function publishPumpMessage(topic, message, pumpTime=null) {
    publisher.publish(topic, message);
    var startDate = new Date();
    console.log("Message: " + message + " sent to " + topic + " at " + startDate);
    if (pumpTime) {
        if (task != null) {
            clearTimeout(task); 
            task = null;
        }
        task = setTimeout(() => {
            var message = JSON.stringify([{device_id:"Speaker", values:["0","0"]}]);
            var topic = "Topic/Speaker";
            publishPumpMessage(topic, message);
            console.log("Task created at " + startDate + " finished, stop pumping.")
        }, pumpTime*60000);
    }
    else {
        if (task != null) {
            clearTimeout(task); 
            task = null;
        }
    }
}

function getTempHumi() {
    var arr = [];
    arr.push(temperature);
    arr.push(humidity);
    return arr;
}

function getPumpState() {
    return pumpState;
}

module.exports = {
    publishPumpMessage: publishPumpMessage,
    getTempHumi: getTempHumi,
    getPumpState: getPumpState
}


