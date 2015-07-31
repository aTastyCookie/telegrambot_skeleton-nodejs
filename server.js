include = function (module) { // just for a time
    return require(__dirname + '/helpers/' + module);
};
f = function () {
    console.log.apply(this, arguments);
};

var fs = require('fs');
var path = require('path');

var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var api = include('api');
var config = include('config');
var i18n = include('i18n');
var ejs = require('ejs');
var async = require('async');

utils = include('utils');

app = express();

var db = include('db');


var sessionOptions = {
    secret: 'keyboard cat',
    key: 'sid',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 24 * 360 * 1000
    },
    store: require('mongoose-session')(db.mongoose, {
        ttl: 60 * 60 * 24 * 360
    })
};
app.use(require('express-session')(sessionOptions));


// НЕ УДАЛЯЙ! Я так проверяю расхождение массивов локалей :D
var diff = _.difference(
    _.keys(require('./locales/en.json')),
    _.keys(require('./locales/ru.json'))
);
if (diff.length) {
    f('Варнинг! Есть расхождения в файлах локали:', diff);
}

app.use(express.static(__dirname + '/public', {
    extensions: ['jpg', 'png', 'jpeg'],
    maxAge: 365 * 24 * 60 * 60
}));


app.locals.utils = utils;


app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());


app.set('view engine', 'ejs');
ejs.delimiter = '?';


app.use(require('cookie-parser')());
app.use(i18n);


var bot = include('bot');



// auto auth user
app.use(function (req, res, next) {
    if (req.query.auth) {
        db.users.findOneAndUpdate({
            auth: req.query.auth
        }, {
            auth: ''
        }, function (err, user) {
            if (user) {
                req.session.identifier = user._id;
                req.session.uid = user.uid;
                req.session.username = user.username;
                req.user = user;
            }
            next();
        });
    } else {
        next();
    }
});

// user spawn
app.use(function (req, res, next) {
    res.locals.user = {};
    res.locals.locale = req.getLocale();

    if (req.session.identifier) {
        db.users.findOne({
            _id: req.session.identifier
        }, function (err, user) {
            if (!err && user) {
                req.user = user;
                res.locals.user = user;
                res.locals.locale = user.lang;
            } else {
                req.session.destroy();
            }
            next();
        });
    } else {
        next();
    }
});


app.get('/', function (req, res) {
    if (req.user) {
        res.redirect(301, '/settings');
    } else {
        res.render('pages/index', {
            type: 'login'
        });
    }
});

app.get('/settings', function (req, res) {
    if (!req.user) {
        res.redirect(301, '/');
    } else {
        res.render('pages/index', {
            type: 'settings'
        });
    }
});

app.get('/lang/:lang', function (req, res) {
    if (req.params.lang && ['en', 'ru'].indexOf(req.params.lang) > -1 && req.user) {
        res.cookie('lang', req.params.lang, {
            expires: new Date(Date.now() + 24 * 60 * 60 * 365 * 1000)
        });

        req.user.lang = req.params.lang;
        req.user.save(function () {
            res.redirect('/');
        });
    }
});


app.get('/logout', function (req, res) {
    req.session.destroy();

    res.redirect('/');
});


app.get('/edit', function (req, res) {
    if (req.user) {
        res.render('pages/index', {
            type: 'edit',
            user: req.user
        });
    } else {
        res.redirect(301, '/');
    }
});

app.get('/l/:local', function (req, res) {
    fs.readFile(__dirname + '/locales/' + req.getLocale() + '.json', function (err, data) {
        res.end('var locale = ' + data.toString());
    });
});


// Routes
app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/users', require('./routes/users.js'));

// Method not found
app.post('/api/*', function (req, res) {
    res.json(api.error('METHOD_NOT_FOUND'));
});


app.listen(config.get('port'), function () {
    f('Server starting. Port: ' + config.get('port'));
});
