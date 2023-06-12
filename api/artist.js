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

const rootDir = path.join(__dirname, '..');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.get('/fetch/id/:artistId', function (request, response) {
    if (request.params.artistId)
    {
        let query = `SELECT * FROM artist WHERE id='${request.params.artistId}'`;
        db.get(query, function(err, row) {
            if (typeof row != "undefined")
            {
                let artistData = {
                    id: row.id,
                    belong_id: row.belong_id,
                    username: row.username,
                    description: row.description,
                    location: row.location,
                    genre: row.genre,
                };

                response.statusCode = 200;
                response.send(JSON.stringify(artistData));
                return;
            } else {
                response.statusCode = 404;
                response.send(JSON.stringify({ status: "Not found by this artistId" }));
                return;
            }
        });
    }
});

router.get('/fetch/name/:artistName', function (request, response) {
    if (request.params.artistName)
    {
        let query = `SELECT * FROM artist WHERE username='${request.params.artistName}'`;
        db.get(query, function(err, row) {
            if (typeof row != "undefined")
            {
                let artistData = {
                    id: row.id,
                    belong_id: row.belong_id,
                    username: row.username,
                    description: row.description,
                    location: row.location,
                    genre: row.genre,
                };

                response.statusCode = 200;
                response.send(JSON.stringify(artistData));
                return;
            } else {
                response.statusCode = 404;
                response.send(JSON.stringify({ status: "Not found by this artistName" }));
                return;
            }
        });
    }
});

router.post('/edit', function (request, response) {
    if (request.body.session_token)
    {
        let query = `SELECT * FROM user WHERE session_token='${request.body.session_token}'`;
        db.get(query, function(err, row) {
            if (typeof row != "undefined")
            {
                let artistUpdateQuery = "";


                db.run(artistUpdateQuery);
            } else {
                response.statusCode = 404;
                response.send(JSON.stringify({ status: "User not found" }));
                return;
            }
        });
    }
});

module.exports = router;