const express = require('express');
const fileUpload = require("express-fileupload");

const router = express.Router(),
      bodyParser = require('body-parser');

const path = require('path');
const fs = require('fs');

// index
router.get('/', function (request, response) {

    response.status(200);
    response.render('index', {
        title: 'Noise',
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