const express = require('express');
const fileUpload = require("express-fileupload");

const router = express.Router(),
      bodyParser = require('body-parser');

const path = require('path');
const fs = require('fs');

const geoip = require('geoip-lite');


// index
router.get('/', function (request, response) {

    var region = geoip.lookup(request.socket.remoteAddress);

    var localeContent = "";
    var localeJSON = "";

    if (region)
    {
        localeContent = fs.readFileSync(`${__dirname}/views/locales/${region.country}`, 'utf8');
        localeJSON = JSON.parse(localeContent);
    } else {
        localeContent = fs.readFileSync(`${__dirname}/views/locales/ru-RU.json`, 'utf8');
        localeJSON = JSON.parse(localeContent);
    }

    response.status(200);
    response.render('index', {
        title: 'Noise',
        locale: localeJSON
    });
});


// 404 HTTP Error
router.get('*', function (request, response) {

    response.status(404);
    response.render('404', {
        title: 'Noise — 404',
    });
});

module.exports = router;