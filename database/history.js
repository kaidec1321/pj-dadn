const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/farming', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var historySchema = mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    _owner_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    date_time: {
        type: Date,
        required: true,
    },
    area: {
        type: Number,
        required: true,
    },
    luminostity: {
        type: Number,
        required: true,
    },
    humidity: {
        type: Number,
        required: true
    },
    water: {
        type: Number,
        required: true
    }
});

var history = mongoose.model('history', historySchema);

async function history_Get(res, _owner_id = '') {
    // res là response object
    // _owner_id là id của chủ vườn
    // gọi hàm này sẽ render tới client lịch sử tưới cây của chủ vườn.
    const prm = await history.findById(_owner_id).sort({
        date_time: 1,
        area: 1
    })
    if ('send' in res) {
        res.send(JSON.stringify(prm));
    }
}

async function history_Post(doc, res = {}) {
    await history.create({
        _id: mongoose.Types.ObjectId(),
        _owner_id: doc._owner_id,
        area: doc.area,
        luminostity: doc.luminostity,
        humidity: doc.humidity,
        water: doc.water
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
}

module.exports = {
    history_Post: history_Post,
    history_Get: history_Get
}