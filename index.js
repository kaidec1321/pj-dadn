var express = require('express');
var mqtt = require('mqtt');
var bodyparser = require('body-parser');
var multer = require('multer');
var { schedule_Post, schedule_Put, schedule_Delete, schedule_Get } = require('./database/schedule.js');
var {history_Get, history_Post} = require('./database/history.js');
const { request } = require('http');
const { Db } = require('mongodb');
var task = null;

var app = express();
var upload = multer();


app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(upload.array());

app.get('/index', (req, res) => {
    res.sendFile(__dirname + '/views/homepage.html');
});

//Pumping

app.get('/pumping', (req, res) => {
    res.sendFile(__dirname + '/views/pumping.html');
});

app.post('/pumping/submit-form', function(req, res) {
    console.log(req.body);
    if (req.body.type == "BƠM NƯỚC NGAY") {
        var message = JSON.stringify([{device_id:"Speaker",values:["1", req.body.intensity]}]);
        var startDate = new Date();
        var topic = "Topic/Speaker";
        publisher.publish(topic, message);
        console.log("Message: " + message + " sent to " + topic + " at " + startDate);
        var time2Pump = parseInt(req.body.minutes);
        if (task != null) {
            clearTimeout(task); 
            task = null;
        }
        task = setTimeout(() => {
            var message = JSON.stringify([{device_id:"Speaker", values:["0","0"]}]);
            var topic = "Topic/Speaker";
            var endDate = new Date();
            publisher.publish(topic, message);
            console.log("Message: " + message + " sent to " + topic + " at " + endDate);
            console.log("Task created at " + startDate + " finished, stop pumping.")
        }, time2Pump*60000)
    }
    if (req.body.type == "DỪNG BƠM") {
        var message = JSON.stringify([{device_id:"Speaker", values:["0","0"]}]);
        var topic = "Topic/Speaker";
        publisher.publish(topic, message);
        console.log("Message: " + message + " sent to " + topic);
    }
    res.sendFile(__dirname+'/views/successful.html');
    
    // var iot = mqttClient.connect('tcp://13.76.250.158:1883', {username: 'BKvm2', password: 'Hcmut_CSE_2020'});
    // iot.subscribe("Topic/Speaker");
    // iot.on('message', function(topic, message) {
    //     status = JSON.parse(message.toString())[0];
    //     // console.log(status);
    //     client.emit('message', status.values);
    // })
    // iot.end();
});


//View temphumi status
app.get('/temphumi', (req, res) => {
    res.sendFile(__dirname + '/views/temphumi.html');
});
    //default value for status
status = ({device_id:"TempHumi",values:["0","0"]});
    //connect to IOT server
// var tempHumiListener = mqtt.connect('http://52.187.125.59', {username: 'BKvm', password: 'Hcmut_CSE_2020'});
var tempHumiListener = mqtt.connect('http://localhost:1883')
tempHumiListener.subscribe('Topic/TempHumi');
tempHumiListener.on('message', function(topic, message) {
    status = JSON.parse(message.toString())[0];
    console.log(status)
    // client.emit('update', status.values)
})

app.get("/data", (req, res) => {
    // console.log('requesting data')
    res.send(status.values)
})

//View history

app.get('/history', (req, res) => {
    res.sendFile(__dirname + '/views/history.html');
});

app.post('/scheduling/post', (req, res) => {
    let { hour, area, light, humidity, amount } = req.body;
    schedule_Post({
        hour: hour,
        area: parseInt(area),
        light: light,
        humidity: humidity,
        amount: amount,
    }, res);
});

//Scheduling
app.get('/scheduling', (req, res) => {
    res.sendFile(__dirname + '/views/scheduling.html');
});

app.get('/scheduling/get', (req, res) => {
    schedule_Get(res);
});

app.post('/scheduling/post', (req, res) => {
    let { area, day, hour, minute } = req.body;
    schedule_Post({
        area: parseInt(area),
        day: day,
        hour: parseInt(hour),
        minute: parseInt(minute),
    }, res);
});

app.post('/scheduling/delete', (req, res) => {
    let { area, day, hour, minute } = req.body;
    schedule_Delete({
        area: parseInt(area),
        day: day,
        hour: parseInt(hour),
        minute: parseInt(minute),
    },res);
});

app.post('/scheduling/put', (req, res) => {
    let { oldArea, oldDay, oldHour, oldMinute } = req.body;
    let { area, day, hour, minute } = req.body;
    schedule_Put({
        area: parseInt(oldArea),
        day: oldDay,
        hour: parseInt(oldHour),
        minute: parseInt(oldMinute),
    }, {
        area: parseInt(area),
        day: day,
        hour: parseInt(hour),
        minute: parseInt(minute),
    }, res)

});


app.listen(3000);
// Code tương tác iot
var publisher = mqtt.connect('http://52.187.125.59', {username: 'BKvm', password: 'Hcmut_CSE_2020'});
