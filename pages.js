const express = require('express');
const fileUpload = require("express-fileupload");

const router = express.Router(),
      bodyParser = require('body-parser');

const path = require('path');
const fs = require('fs');

// index
router.get('/', function (request, response) {
    response.render('index', {
        title: 'Noise',
    });
});

module.exports = router;