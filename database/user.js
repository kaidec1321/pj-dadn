const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/farming', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var userSchema = mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    user_name: {
        type: String,
        required: true,
        maxlength: 10
    },
    password: {
        type: String,
        required: true,
        maxlength: 32
    },
    name: {
        type: String,
        required: true,
    },
    birth_date: {
        type: Date,
        required: true
    },
    avatar: {
        type: String,
        required: true
    },
    most_recent_login: {
        type: Date,
        dafault: Date.now
    }
});

userSchema.statics.authenticate = function (user, password, callback) {
    console.log(user+password);
    User.findOne({ user_name: user }).exec(function (err, user) {
        if (err) {
          return callback(err)
        } else if (!user) {
          var err = new Error('User not found.');
          err.status = 401;
          return callback(err);
        }
        if (password === user.password) {
            return callback(null, user);
        } 
        else {
            return callback();
        }
    })
}

async function user_Get(doc, res) {
    const prm = await user.findOne({
        user_name: doc.user_name
    });
    if ('send' in res) {
        res.send(JSON.stringify(prm));
    }
}

async function user_Post(doc, res = {}) {
    await user.find({
        user_name: doc.user_name,
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
        user.create({
            _id: mongoose.Types.ObjectId(),
            user_name: doc.user_name,
            password: doc.password,
            name: doc.name,
            birth_date: doc.birth_date,
            avatar: doc.avatar,
            most_recent_login: doc.most_recent_login
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

// user.create({
//     _id: mongoose.Types.ObjectId(),
//     user_name: "admin",
//     password: "admin",
//     name: "admin",
//     birth_date: new Date(12,1,1999),
//     avatar: "None",
//     most_recent_login: new Date(16,7,2020,9,18,55)
// });

async function user_Put(doc, newDoc, res) {
    await user_Delete(doc);
    await user_Post(newDoc, res);
}

async function user_Delete(doc, res = {}) {
    await user.deleteOne({
        user_name: doc.user_name,
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

var User = mongoose.model('User', userSchema);

module.exports = User