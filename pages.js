const express = require('express');
const fileUpload = require("express-fileupload");

const router = express.Router(),
      bodyParser = require('body-parser');

const path = require('path');
const { getLocaleByIP } = require('./functions');


// index
router.get('/', function (request, response) {
    response.status(200);
    response.render('index', {
        title: 'Noise',
        locale: getLocaleByIP(request.socket.remoteAddress)
    });
});

// Sign In
router.get('/signin', function (request, response) {
    response.status(200);
    response.render('signin', {
        title: 'Noise',
        locale: getLocaleByIP(request.socket.remoteAddress)
    });
});

// 404 HTTP Error
router.get('*', function (request, response) {
    response.status(404);
    response.render('404', {
        title: 'Noise — 404',
        locale: getLocaleByIP(request.socket.remoteAddress)
    });
});

module.exports = router;