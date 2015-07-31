var telegram = require('telegram-bot-api');
var db = include('db');
var async = require('async');
var config = include('config');
var i18n = require('i18n');
var request = require('request');

i18n.configure({
    // setup some locales - other locales default to en silently
    locales:['en', 'ru'],

    // where to store json files - defaults to './locales' relative to modules directory
    directory: __dirname + '/../locales',

    defaultLocale: 'en',

    // sets a custom cookie name to parse locale settings from  - defaults to NULL
    cookie: 'lang'
});

var api = new telegram({
    token: 'token',
    updates: {
        enabled: true,
        get_interval: 200
    }
});



api.on('message', function (obj) {
    var t = obj.text;
    var chatID = obj.chat.id;
    var userID = obj.from.id;
    var host = config.get(process.env.NODE_ENV + ":host");

    async.waterfall([
        // register user
        function (callback) {
            db.users.findOne({uid: obj.from.id}, callback);
        },
        function (user, callback) {
            if (user) {
                callback(null, user);
            } else {
                db.users.create({
                    uid: obj.from.id,
                    first_name: obj.from.first_name,
                    last_name: obj.from.last_name,
                    username: obj.from.username
                }, callback);
            }
        },
        function (user, callback) {
            i18n.setLocale(user.lang);

            // generation link for auto login user
            if (t == '/login') {
                var hash = utils.generateHash();
                user.auth = hash;
                user.save(function () {
                    api.sendMessage({
                        chat_id: userID,
                        text: i18n.__('bot_text_follow_link_to_login', host, hash)
                    });
                });
            }

            if (t == '/test') {
                api.sendMessage({
                    chat_id: chatID,
                    text: i18n.__('bot_text_test')
                });
            }

            if (t == '/w') {

            }
        }
    ], function (err, result) {
        f(err);
    });
});

module.exports = api;