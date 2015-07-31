var path = require('path');
var express = require('express');
var router = express.Router();
var api = include('api');
var db = include('db');
var _ = require('lodash');
var request = require('request');

var fs = require('fs');

/*
// auth check
router.use(function (req, res, next) {
    if (req.user) {
        next();
    } else {
        res.json(api.error(420, 'NOT_LOGGED'));
    }
});*/


function city(str, cb) {
    request.get('http://api.openweathermap.org/data/2.5/find?mode=json&type=like&q=' + decodeURIComponent(str) + '&cnt=10', function (err, req, body) {
        if (err) {
            cb(err);
        } else {
            var obj = JSON.parse(body);
            var arr = [];
            if (obj.count) {
                obj.list.forEach(function(o) {
                    arr.push({
                        city: o.name,
                        country: o.sys.country
                    });
                });
                cb(null, arr);
            } else {
                cb(null, null);
            }
        }
    });
}


router.route('/city').post(function (req, res) {
    if (req.body.city && req.body.city.length > 2) {
        city(req.body.city, function (err, result) {
            f(result);
            res.json(api.res(result));
        });
    } else {
        res.json(api.res(null));
    }
});

router.route('/private').post(function (req, res) {
    f(req.body);
});

module.exports = router;
