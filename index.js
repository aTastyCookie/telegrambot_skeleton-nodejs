var telegram = require('telegram-bot-api');
var db = require(__dirname + '/helpers/db');
var async = require('async');

var api = new telegram({
    token: 'token',
    updates: {
        enabled: true,
        get_interval: 200
    }
});


f = function () {
    console.log.apply(this, arguments);
};



api.on('message', function (obj) {
    var t = obj.text, id = obj.chat.id;

    async.waterfall([
        function (callback) {
            db.users.findOne({uid: obj.from.id}, callback);
        },
        function (user, callback) {
            if (user) {
                callback(null, user);
            } else {
                db.users.create({
                    uid: obj.from.uid,
                    first_name: obj.from.first_name,
                    last_name: obj.from.last_name,
                    username: obj.from.username
                }, callback);
            }
        },
        function (user, callback) {
            api.sendMessage({
                chat_id: id,
                text: JSON.stringify(user)
            });
        }
    ]);
});