const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/farming', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var scheduleSchema = mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
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
    await schedule.find({
        day: doc.day,
        hour: doc.hour,
        minute: doc.minute,
        area: doc.area,
    }).exec(function(err, docs) {
        if (err) {
            if ('send' in res) {
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
        schedule.create({
            _id: mongoose.Types.ObjectId(),
            day: doc.day,
            hour: doc.hour,
            minute: doc.minute,
            area: doc.area,
        }, (err) => {
            if (err) {
                if ('send' in res) {
                    res.send('fail');
                }
                return;
            }
            if ('send' in res) {
                res.send('success');
            }
            return;
        });
    });
}

async function schedule_Delete(doc, res = {}) {
    await schedule.deleteOne({
        day: doc.day,
        hour: doc.hour,
        minute: doc.minute,
        area: doc.area
    }, err => {
        if (err) {
            if ('send' in res) {
                res.send('fail');
                return;
            }
        }
        if ('res' in res) {
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