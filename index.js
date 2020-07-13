var express = require('express');
var mqtt = require('mqtt');
var bodyparser = require('body-parser');
var multer = require('multer');
var { schedule_Post, schedule_Put, schedule_Delete, schedule_Get } = require('./database/schedule.js');
var { history_Get, history_Post } = require('./database/history.js');
var { publishPumpMessage, getTempHumi, getPumpState } = require('./iot/iot.js');
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

// Code tương tác iot

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
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
            if (getPumpState()) {
                res.status(200).send("busy");
                return;
            }
            var message = JSON.stringify([{device_id:"Speaker",values:["1", req.body.intensity]}]);
            var topic = "Topic/Speaker";
            publishPumpMessage(topic, message, parseInt(req.body.minutes));
            res.status(200).send("success");
            return;
        }
        if (req.body.type == "stop") {
            if (getPumpState()) {
                var message = JSON.stringify([{device_id:"Speaker", values:["0","0"]}]);
                var topic = "Topic/Speaker";
                publishPumpMessage(topic, message);
                res.status(200).send("success");
            }
            else res.status(200).send("fail");
            return;
        }
        if (req.body.type == "force") {
            var message = JSON.stringify([{device_id:"Speaker",values:["1", req.body.intensity]}]);
            var topic = "Topic/Speaker";
            publishPumpMessage(topic, message, parseInt(req.body.minutes));
            console.log("Overwrite Task!");
            res.status(200).send("success");
            return;
        }
    }
    else res.status(200).send('noarea');

});

//VIEW STATUS

app.get('/temphumi', (req, res) => {
    res.sendFile(__dirname + '/views/temphumi.html');
});
    //default value for status
status = ({device_id:"TempHumi",values:["0","0"]});

// tempHumiListener.subscribe('Topic/TempHumi');
// tempHumiListener.on('message', function(topic, message) {
//     status = JSON.parse(message.toString())[0];
//     // console.log(status)
//     // client.emit('update', status.values)
// })

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
    let { area, day, hour, minute, water } = req.body;
    schedule_Post({
        area: parseInt(area),
        day: day,
        hour: parseInt(hour),
        minute: parseInt(minute),
        water: parseInt(water)
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
    let { area, day, hour, minute, water } = req.body;
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
        water: parseInt(water)
    }, res)

});



app.listen(3000);
