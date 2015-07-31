var i18n = require('i18n');

i18n.configure({
    // setup some locales - other locales default to en silently
    locales:['en', 'ru'],

    // where to store json files - defaults to './locales' relative to modules directory
    directory: __dirname + '/../locales',

    defaultLocale: 'en',

    // sets a custom cookie name to parse locale settings from  - defaults to NULL
    cookie: 'lang'
});



module.exports = function(req, res, next) {
    i18n.init(req, res);
    res.locals._ = res.__ = function() {
        return i18n.__.apply(req, arguments);
    };

    res.locals._n = res.__n = function() {
        return i18n.__n.apply(req, arguments);
    };

    next();
};
