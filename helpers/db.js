var mongoose = require('mongoose');
var config = require(__dirname + '/config');
var utils = require(__dirname + '/utils');

var shemaOptions = {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
};


var users = new (mongoose.Schema)({
    uid: {type: Number, unique: true},
    name: String,
    username: String,
    reg_ts: {type: String, default: utils.timestamp()},
    auth: String,
    lang: {
        type: String,
        default: 'en'
    }
}, shemaOptions);


if (!global.__dbInstance) {
    mongoose.connect(config.get('mongoose:uri'));

    global.__dbInstance = {
        mongoose: mongoose,
        users: mongoose.model('User', users)
    };
}

module.exports = global.__dbInstance;
