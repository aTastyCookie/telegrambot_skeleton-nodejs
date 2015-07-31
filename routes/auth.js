var express = require('express');
var async = require('async');
var router = express.Router();
var api = include('api');
var db = include('db');


router.route('/sendCode').post(function (req, res) {
    var username = req.body.username;
    if (username) {
        username = username.trim();
        username = username.substr(0, 1) == '@' ? username.substr(1) : username;
    }

    var isUsername = function (data) {
        var regexp = /^[A-Za-z0-9_]{5,50}$/i;
        return username[0] != '_' && username[data.length - 1] != '_' && regexp.test(username);
    };

    var saveData = function () {
        req.session.credential = username;

        if (process.platform !== 'win32') {
            req.session.code = utils.generateCode();
        } else {
            req.session.code = '11111'
        }

        req.session.generationTime = Date.now();
    };

    if (username && isUsername(username)) { // You can use a-z, 0-9 and underscores. Minimum length is 5 characters.
        saveData();


        if (process.platform !== 'win32') {
            tg.isUsername(username, function (err, isUsername) {
                f(err, isUsername)
                if (isUsername) {
                    db.users.count({uid: isUsername.id}, function (err, isUser) {
                        if (isUser) {
                            tg.sendUsername(username, 'Telegram Friends code ' + req.session.code, function (err, userid) {
                                if (err || !userid) {
                                    res.json(api.error(420, 'INCORRECT_USERNAME'));
                                } else {
                                    req.session.uid = userid.id;
                                    res.json(api.res('SEND_OK'));
                                }
                            });
                        } else {
                            req.session.uid = +isUsername.id;
                            req.session.register = true;
                            res.json(api.res('NOT_REGISTER_USER'));
                        }
                    });
                } else {
                    res.json(api.error(420, 'INCORRECT_USERNAME'));
                }
            });
        } else {
            db.users.findOne({name: username}, function (err, isUser) {
                if (isUser) {
                    req.session.uid = isUser.uid;
                    res.json(api.res('SEND_OK'));
                } else {
                    req.session.uid = utils.generateCode();
                    req.session.register = true;
                    res.json(api.res('NOT_REGISTER_USER'));
                }
            });
        }
    } else {
        res.json(api.error(420, 'INCORRECT_USERNAME'));
    }
});

router.route('/checkCode').post(function (req, res) {
    var code = req.body.code;

    if (req.session.register) {
        code = req.session.code;
    }

    async.waterfall([
        function (callback) {
            if (req.session.uid && req.session.code && req.session.code == code) {
                callback(null);
            } else {
                callback('INCORRECT_CODE');
            }
        },
        function (callback) {
            db.users.findOne({
                uid: req.session.uid
            }, function (err, user) {
                if (err) {
                    callback('ERROR_DB_USER_CHECK_CODE');
                } else {
                    if (user) {
                        callback(null, 'login', user);
                    } else {
                        callback(null, 'register', {});
                    }
                }
            });
        },
        function (type, user, callback) {
            function login() {
                req.session.identifier = user._id;
                if (process.platform !== 'win32') {
                    tg.sendUsername('highfeed', 'Login user: @' + req.session.credential + ' User ID: ' + req.session.uid, function () {
                        callback(null, false);
                    });
                } else {
                    callback(null, false);
                }
            }

            switch (type) {
                case 'login':
                {
                    if (user.name != req.session.credential) {
                        if (process.platform !== 'win32') {
                            tg.sendUsername('highfeed', 'Change username: @' + user.name + ' -> @' + req.session.credential + ' User ID: ' + req.session.uid);
                        }
                        user.name = req.session.credential;
                        user.save(function (err, user) {
                            login();
                        });
                    } else {
                        login();
                    }
                }
                    break;
                case 'register':
                {
                    db.users.create({
                        name: req.session.credential,
                        uid: req.session.uid,
                        create_ts: utils.timestamp()
                    }, function (err, user) {
                        if (err) {
                            callback('ERROR_DB_USER_CHECK_CODE');
                        } else {
                            req.session.identifier = user._id;
                            if (process.platform !== 'win32') {
                                tg.sendUsername('highfeed', 'New user: @' + req.session.credential + ' User ID: ' + req.session.uid);
                                tg.sendUsername(req.session.credential, res.__('telegram_message_welcome', req.session.credential), function (err, userid) {
                                    callback(null, true);
                                });
                            } else {
                                callback(null, true);
                            }
                        }
                    });
                }
                    break;
            }
        }
    ], function (err, callback) {
        if (err) {
            res.json(api.error(420, err));
        } else {
            res.cookie('user_is_registered', true, {expires: new Date(Date.now() + 24 * 60 * 60 * 365 * 1000)});
            res.json(api.res({register: callback}));
        }
    });
});

module.exports = router;