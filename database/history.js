const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/farming', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => {
    if (err) throw err;
});

var historySchema = mongoose.Schema({
    _owner_id: {
        type: mongoose.Schema.Types.ObjectId,
    },
    date_time: {
        type: Date,
        required: true,
    },
    area: {
        type: Number,
        required: true,
    },
    luminosity: {
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

// async function history_Get(res) {
// // async function history_Get(res, _owner_id = '') {
//     // res là response object
//     // _owner_id là id của chủ vườn
//     // gọi hàm này sẽ render tới client lịch sử tưới cây của chủ vườn.

//     // const prm = await history.findById(_owner_id).sort({
//     //     date_time: 1,
//     //     area: 1
//     // })
//     const prm = await history.find({}).sort({
//         date_time: 1,
//         area: 1,
//     })
//     if ('send' in res) {
//         res.send(JSON.stringify(prm));
//     }
// }

async function history_Get(doc, res) {
    // doc là 1 đối tượng
    //doc={
    //    day:Number,
    //    month:Number,
    //    year:Number
    //}
    // res là response object
    // _owner_id là id của chủ vườn
    // gọi hàm này sẽ render tới client lịch sử tưới cây của chủ vườn.
    const prm = await history.find({
        date_time: {
            $gte: new Date(doc.year, doc.month - 1, doc.day),
            $lt: new Date(doc.year, doc.month - 1, doc.day + 1)
        }
    }).sort({
        date_time: 1,
        area: 1
    })
    
    if ('send' in res) {
        res.send(JSON.stringify(prm));
    }
}




async function history_Post(doc, res = {}) {
    /* 
    doc là một đối tượng
    doc={
        date_time: Date.now()(thời điểm sự kiện diễn ra).
        area: 1->4,
        luminosity: 1 số nguyên (độ sáng),
        humidity: 1 số nguyên (độ ẩm),
        water: 1 số nguyên (lượng nước tưới)
    } 
    
    res là một đối tượng Response*/
    await history.create(doc, (err) => {
        if (err) {
            console.log(err.message);
            if ('send' in res) {
                res.send('fail');
            }
            return;
        }
        console.log('success');
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