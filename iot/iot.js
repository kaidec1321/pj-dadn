var mqtt = require('mqtt');
const mongoose = require('mongoose');
var pumpState = false;
var humidity = 0;
var temperature = 0;
var task = null;
const { history_Get, history_Post } = require('../database/history.js');

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

<<<<<<< HEAD
tempHumiListener.subscribe('Topic/TempHumi');
=======
tempHumiListener.subscribe("Topic/TempHumi")
>>>>>>> 3cd070e1900e2d597399705bb678cbb1e355826b
tempHumiListener.on('message', function(topic, message) {
    var status = JSON.parse(message.toString());
    console.log(status);
    try {
        temperature = Number(status[0].values[0]);
        humidity = Number(status[0].values[1]); 
        //Check humidity, temperature and auto-pump if the conditions - decided by the team, are satisfied  
        if (humidity < 20 && temperature > 30 && !pumpState) {
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

function publishPumpMessage(mode, pumpTime=null, intensity="0", area="1") {
    var startDate = new Date();
    var topic = "Topic/Speaker";
    var message = JSON.stringify([{device_id:"Speaker", values:[mode, intensity]}]);
    publisher.publish(topic, message);
    console.log("Message: " + message + " sent to " + topic + " at " + startDate);
    if (pumpTime) {
        if (task != null) {
            clearTimeout(task); 
            task = null;
        }
        task = setTimeout(() => {
            publishPumpMessage("0");
            console.log("Task created at " + startDate + " finished, stop pumping.")
        }, parseInt(pumpTime)*60000);
    }
    else {
        if (task != null) {
            clearTimeout(task); 
            task = null;
        }
        history_Post({
            _owner_id: mongoose.Types.ObjectId(),
            area: area,
            luminosity: temperature,
            humidity: humidity,
            water: 1000,
            date_time: Date.now()
        });
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


