const express = require('express');
const fileUpload = require("express-fileupload");

const router = express.Router(),
    bodyParser = require('body-parser');

const path = require('path');
const fs = require('fs');

const customConsole = require("../utils/console.js");

const crypto = require('crypto');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

router.get('/fetch/:songid', function (request, response) {
    if (request.params.songid)
    {
        const songQuery = `SELECT * FROM song WHERE id='${request.params.songid}`;
        
    }
});

module.exports = router;