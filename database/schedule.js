const mongoose = require('mongoose');
const CronJob = require('cron').CronJob;
mongoose.set('useFindAndModify', false);
const { publishPumpMessage, getTempHumi, getPumpState } = require('../iot/iot.js');
const { history_Get, history_Post } = require('./history.js');

var dayInWeek = {
    "Thứ hai": 1,
    "Thứ ba": 2,
    "Thứ tư": 3,
    "Thứ năm": 4,
    "Thứ sáu": 5,
    "Thứ bảy": 6,
    "Chủ nhật": 0
};
var job = {};

mongoose.connect('mongodb://localhost/farming', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var scheduleSchema = mongoose.Schema({
    _owner_id: {
        type: mongoose.Schema.Types.ObjectId,
    },
    day: {
        type: String,
        required: true,
    },
    hour: {
        type: Number,
        required: true,
        validate: {
            validator: function(hour) {
                return hour >= 0 && hour <= 23;
            },
            message: 'Giá trị giờ không hợp lệ.'
        }
    },
    minute: {
        type: Number,
        required: true,
        validate: {
            validator: function(minute) {
                return minute >= 0 && minute <= 59;
            },
            message: 'Giá trị phút không hợp lệ.'
        }
    },
    water: {
        type: Number,
        required: true,
        validate: {
            validator: function(water) {
                return water > 0;
            },
            message: "Giá trị lượng nước tưới không hợp lệ."
        }
    },
    area: {
        type: Number,
        required: true,
        validate: {
            validator: function(area) {
                return area >= 0;
            },
            message: 'Giá trị khu vực sai.'
        }
    }
});

var schedule = mongoose.model('schedules', scheduleSchema);


async function schedule_Post(doc, res = {}) {
    /* 
    doc là một đối tượng
    doc={
        day: "Thứ hai" -> "Chủ Nhật", (nhớ gõ bằng unicode tổ hợp)
        hour: 1 số nguyên,
        minute: 1 số nguyên,
        area: 1->4
    } 
    
    res là một đối tượng Response*/
    await schedule.find({
        day: doc.day,
        hour: doc.hour,
        minute: doc.minute,
        area: doc.area
    }).exec(function(err, docs) {
        if (err) {
            if ('send' in res) {
                console.log(err.message);
                res.send('fail');
            }
            return;
        }
        if (docs.length > 0) {
            if ('send' in res) {
                res.send('fail');
            }
            return;
        }
        schedule.create(doc, (err, created_doc) => {
            if (err) {
                if ('send' in res) {
                    console.log(err.message);
                    res.send('fail');
                }
                return;
            }
            job[created_doc._id] = new CronJob({
                cronTime: '0 ' + doc.minute + ' ' + doc.hour + ' * * ' + dayInWeek[doc.day], // Chạy Jobs vào thời điểm đã hẹn
                onTick: function() {
                    let date_time = Date.now();
                    let humidity = 0;
                    let luminosity = 0;
                    //Viết đoạn code chạy máy bơm, thời gian chạy tùy ý, t sẽ chỉnh cho người dùng chọn sau. 
                    publishPumpMessage("1", doc.water, "150");//giá trị 150 là cường độ
                    //Viết đoạn code đọc độ ẩm và ánh sáng, lưu vào 2 biến humidity và luminosity
                    //lấy thời gian tưới do người dùng nhập vào qua doc.water 


                    console.log('0 ' + doc.minute + ' ' + doc.hour + ' * * ' + dayInWeek[doc.day] + ' Cron jub runing...');
                },
                start: true,
                timeZone: 'Asia/Ho_Chi_Minh' // Lưu ý set lại time zone cho đúng 
            });
            job[created_doc._id].start();
            if ('send' in res) {
                res.send('success');
            }
            return;
        });
    });
}

async function schedule_Delete(doc, res = {}) {
    /* 
    doc là một đối tượng
    doc={
        day: "Thứ hai" -> "Chủ Nhật", (nhớ gõ bằng unicode tổ hợp)
        hour: 1 số nguyên,
        minute: 1 số nguyên,
        area: 1->4
    } 
    
    res là một đối tượng Response*/
    await schedule.findOneAndDelete(doc, (err, deleted_doc) => {
        if (err) {
            if ('send' in res) {
                res.send('fail');
                return;
            }
        }
        job[deleted_doc._id].stop();
        if ('send' in res) {
            res.send('success');
            return;
        }
    });
}

async function schedule_Put(doc, newDoc, res) {
    await schedule_Delete(doc);
    await schedule_Post(newDoc, res);
}

async function schedule_Get(res) {
    const prm = await schedule.find({}).sort({
        area: 1,
        day: 1,
        hour: 1,
        minute: 1,
    })
    if ('send' in res) {
        res.send(JSON.stringify(prm));
    }
}

module.exports = {
    schedule_Post: schedule_Post,
    schedule_Put: schedule_Put,
    schedule_Delete: schedule_Delete,
    schedule_Get: schedule_Get
}