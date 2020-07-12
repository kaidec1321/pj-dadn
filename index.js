var express = require('express');
var mqtt = require('mqtt');
var bodyparser = require('body-parser');
var multer = require('multer');
var { schedule_Post, schedule_Put, schedule_Delete, schedule_Get } = require('./database/schedule.js');

var app = express();
var upload = multer();


app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(upload.array());

//Pumping

app.get('/pumping', (req, res) => {
    res.sendFile(__dirname + '/views/pumping.html');
});

app.post('/pumping/submit-form', function(req, res) {
    console.log(req.body);
    if (req.body.type == "BƠM NƯỚC NGAY") {
        var message = JSON.stringify([{device_id:"Speaker",values:["1", req.body.intensity]}]);
        var topic = "Topic/Speaker";
        publisher.publish(topic, message);
        console.log("Message: " + message + " sent to " + topic);
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

// var io = require('socket.io')(webserver)

// io.on('connection', function (client) {
//     client.on('join', function (data) {console.log(data)});
//     client.on('action', function(message) {
//         // console.log('update requested')

//         // this part is for real device
//         var iot = mqttClient.connect('tcp://13.76.250.158:1883', {username: 'BKvm2', password: 'Hcmut_CSE_2020'});
//         // new_mess = JSON.stringify([{"device_id": 'Speaker', "values": ['hii']}])
//         // iot.publish("Topic/Speaker", new_mess)
//         iot.subscribe("Topic/TempHumi");

//         // this part is for fake device 
//         // var iot = mqttClient.connect('http://localhost:1883');
//         // iot.publish("Topic2/TempHumi",'')
//         // iot.subscribe("Topic1/TempHumi")

//         iot.on('message', function(topic, message) {
//             // real
//             // status = JSON.parse(message.toString())[0];
//             // console.log(status);
//             // client.emit('message', status.values);

//             // fake
//             // status = JSON.parse(message.toString())[0];
//             // console.log(status)
//             // client.emit('message', status.values)

//             status = JSON.parse(message.toString())
//             console.log(status)
//         })
//         iot.end();
//     });
//     client.on('message', function(message) {
//         console.log(message);
//     })
// });

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

var tempHumiListener = mqtt.connect('http://52.187.125.59', {username: 'BKvm', password: 'Hcmut_CSE_2020'});


// tempHumiListener.subscribe('Topic/TempHumi');
// tempHumiListener.on('message', function(topic, message) {
//     var status = JSON.parse(message.toString());
//     console.log(status);
//     var temp = Number(status[0].values[0]);
//     var humi = Number(status[0].values[1]); 
//     if (humi < 20 && temp > 30) {
//         console.log('Temperature: ' + status[0].values[0] + ' - Humidity: ' + status[0].values[1] + ' - AUTO START MOTOR');
//         var message = JSON.stringify([{device_id: 'Speaker', values: ['1', '150']}]);
//         iot2.publish('Topic/Speaker', message);
//         console.log("Message: " + message + " auto sent to Topic/Speaker");
//     }
// });
