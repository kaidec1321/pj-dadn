var express = require('express');
var mqtt = require('mqtt');
var bodyparser = require('body-parser');
var multer = require('multer');
var { schedule_Post, schedule_Put, schedule_Delete, schedule_Get } = require('./database/schedule.js');
var {history_Get, history_Post} = require('./database/history.js');
const { request } = require('http');
const { Db } = require('mongodb');
var task = null;
var pumpState = false;

var app = express();
var upload = multer();


app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(upload.array());

app.get('/index', (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
});

app.post('/homepage', function(req, res) {
    console.log(req.body);
    if (req.body.btnLogin == "Đăng nhập") {
        var username = req.body.username;
        var password = req.body.password;
        if (username == "") {
            //
        }
        else if (password == ""){
            // alert("Bạn chưa nhập mật khẩu!");
        }
    } 
    res.sendFile(__dirname+'/views/homepage.html');
});

app.get('/homepage', (req, res) => {
    res.sendFile(__dirname + '/views/homepage.html');
});

//Pumping
app.get('/pumping', (req, res) => {
    res.sendFile(__dirname + '/views/pumping.html');
});

app.post('/pumping/submit-form', function(req, res) {
    console.log(req.body);
    if (req.body.area == "1") {
        if (req.body.type == "start") {
            if (pumpState) {
                res.status(200).send("busy");
                return;
            }
            pumpState = true;
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
            }, time2Pump*60000);
            res.status(200).send("success");
            return;
        }
        if (req.body.type == "stop") {
            if (pumpState) {
                pumpState = false;
                var message = JSON.stringify([{device_id:"Speaker", values:["0","0"]}]);
                var topic = "Topic/Speaker";
                publisher.publish(topic, message);
                console.log("Message: " + message + " sent to " + topic);
                res.status(200).send("success");
            }
            else res.status(200).send("fail");
            return;
        }
        if (req.body.type == "force") {
            var message = JSON.stringify([{device_id:"Speaker",values:["1", req.body.intensity]}]);
            var startDate = new Date();
            var topic = "Topic/Speaker";
            publisher.publish(topic, message);
            console.log("Message: " + message + " sent to " + topic + " at " + startDate + " - Overwrite Task!");
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
            }, time2Pump*60000);
            res.status(200).send("success");
            return;
        }
    }
    else res.status(200).send('noarea');

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

app.post('/history/post', (req, res) => {
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
var publisher = mqtt.connect('http://localhost:1883');

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


var tempHumiListener = mqtt.connect('http://localhost:1883');

tempHumiListener.subscribe('Topic/TempHumi');
tempHumiListener.on('message', function(topic, message) {
    var status = JSON.parse(message.toString());
    console.log(status);
    try {
        var temp = Number(status[0].values[0]);
        var humi = Number(status[0].values[1]); 
        //Check humidity, temperature and auto-pump if the conditions - decided by the team, are satisfied  
        if (humi < 20 && temp > 30) {
            console.log('Temperature: ' + status[0].values[0] + ' - Humidity: ' + status[0].values[1] + ' - AUTO START MOTOR');
            var message = JSON.stringify([{device_id: 'Speaker', values: ['1', '150']}]);
            iot2.publish('Topic/Speaker', message);
            console.log("Message: " + message + " auto sent to Topic/Speaker");
        }
    }
    catch {
        console.log("REJECTED - Wrong data format!")
    }
    
});
