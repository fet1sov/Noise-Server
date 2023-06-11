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

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/songlist/:artistId', function (request, response) {
    if (request.params.artistId)
    {
        let query = `SELECT * FROM song WHERE artist_id='${request.params.artistId}'`;
        db.all(query, function(err, rows) {
            if (typeof rows != "undefined")
            {

            }
        });
    }
});

module.exports = router;