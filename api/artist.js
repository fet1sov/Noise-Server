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

function logMessage(tag, message, type)
{
    if (type === 0) { // Info message
        console.log(`${customConsole.BgGray + customConsole.FgWhite}${tag}${customConsole.BgBlack + customConsole.FgGray} ${message}`);
    } else if (type === 1) { // Success message
        console.log(`${customConsole.BgGreen + customConsole.FgWhite}${tag}${customConsole.BgBlack + customConsole.FgGreen} ${message}`);
    } else if (type === 2) { // Warn message
        console.log(`${customConsole.BgYellow + customConsole.FgWhite}${tag}${customConsole.BgBlack + customConsole.FgYellow} ${message}`);
    } else if (type === 3) { // Error message
        console.log(`${customConsole.BgRed + customConsole.FgWhite}${tag}${customConsole.BgBlack + customConsole.FgRed} ${message}`);
    }
}

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(fileUpload());

router.get('/fetch/id/:artistId', function (request, response) {
    if (request.params.artistId)
    {
        let query = `SELECT * FROM artist WHERE id='${request.params.artistId}'`;
        db.get(query, function(err, row) {
            if (typeof row != "undefined")
            {
                let bannerURL = "";
                if (fs.existsSync(rootDir + "/public/banner/" + row.id + ".png")) {
                    bannerURL = `/banner/${row.id}.png`;
                } else if (fs.existsSync(rootDir + "/public/banner/" + row.id + ".gif")) {
                    bannerURL = `/banner/${row.id}.gif`;
                }

                let artistData = {
                    id: row.id,
                    belong_id: row.belong_id,
                    username: row.username,
                    description: row.description,
                    location: row.location,
                    genre: row.genre,
                    banner: bannerURL
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
                let bannerURL = "";
                if (fs.existsSync(rootDir + "/public/banner/" + row.id + ".png")) {
                    bannerURL = `/banner/${row.id}.png`;
                } else if (fs.existsSync(rootDir + "/public/banner/" + row.id + ".gif")) {
                    bannerURL = `/banner/${row.id}.gif`;
                }

                let artistData = {
                    id: row.id,
                    belong_id: row.belong_id,
                    username: row.username,
                    description: row.description,
                    location: row.location,
                    genre: row.genre,
                    banner: bannerURL
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

router.get('/fetch/userid/:userid', function (request, response) {
    if (request.params.userid)
    {
        logMessage("API [ARTIST]", "Got a request fetching by UID: " + request.params.userid, 0)
        let query = `SELECT * FROM artist WHERE belong_id='${request.params.userid}'`;
        db.get(query, function(err, row) {
            if (typeof row != "undefined")
            {
                let bannerURL = "";
                if (fs.existsSync(rootDir + "/public/banner/" + row.id + ".png")) {
                    bannerURL = `/banner/${row.id}.png`;
                } else if (fs.existsSync(rootDir + "/public/banner/" + row.id + ".gif")) {
                    bannerURL = `/banner/${row.id}.gif`;
                }

                let artistData = {
                    id: row.id,
                    belong_id: row.belong_id,
                    username: row.username,
                    description: row.description,
                    location: row.location,
                    genre: row.genre,
                    banner: bannerURL
                };

                response.statusCode = 200;
                response.send(JSON.stringify(artistData));
                return;
            } else {
                response.statusCode = 404;
                response.send(JSON.stringify({ status: "Not found artist card by this user id" }));
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
                let thumbnailFile = undefined;
                let thumbnailUploadPath = "";
                let thumbnailExtension = "";
                try {
                    if (typeof request.files.thumbnail != "undefined") {
                        thumbnailFile = request.files.thumbnail;
                    }
                } catch {

                }

                let selectQuery = `SELECT * FROM artist WHERE belong_id='${row.id}'`;
                db.get(selectQuery, function(err, artistRow) {
                    if (typeof artistRow != "undefined")
                    {
                        let occupyQuery = `SELECT * FROM artist WHERE UPPER(username) LIKE UPPER('${request.body.username}')`;
                        db.get(occupyQuery, function(err, occupyRow) {
                            if (typeof occupyRow != "undefined")
                            {
                                response.statusCode = 504;
                                response.send(JSON.stringify({ status: "Name already occupied" }));
                                return;
                            } else {
                                fs.unlink(thumbnailUploadPath, () => {});
                                if (typeof thumbnailFile != "undefined")
                                {
                                    thumbnailExtension = thumbnailFile.mimetype.split("/")[1];
                                    if (thumbnailExtension === "png"
                                        || thumbnailExtension === "jpeg"
                                        || thumbnailExtension === "webp") {
                                        thumbnailUploadPath = rootDir + "/public/banner/" + artistRow.id + ".png";
                                    } else if (uploadedFileExtension === "gif") {
                                        thumbnailUploadPath = rootDir + "/public/banner/" + artistRow.id + ".gif";
                                    }

                                    thumbnailFile.mv(thumbnailUploadPath, function (err) {
                                        logMessage("API", `Successfully uploaded thumbnail file (ID: ${artistRow.id}) on server`, 3);
                                    });
                                }

                                logMessage("SQL", `UPDATE artist SET username='${request.body.username}', description='${request.body.description}', genre='${request.body.genre_id}'`, 2);
                                let artistUpdateQuery = `UPDATE artist SET username='${request.body.username}', description='${request.body.description}', genre='${request.body.genre_id}' WHERE id='${artistRow.id}'`;
                                db.run(artistUpdateQuery);

                                response.statusCode = 200;
                                response.send(JSON.stringify({ status: "Succesfully edited artist profile" }));
                                return;
                            }
                        });
                    } else {
                        let occupyQuery = `SELECT * FROM artist WHERE UPPER(username) LIKE UPPER('${request.body.username}')`;
                        db.get(occupyQuery, function(err, occupyRow) {
                            if (typeof occupyRow != "undefined")
                            {
                                response.statusCode = 504;
                                response.send(JSON.stringify({ status: "Name already occupied" }));
                                return;
                            } else {
                                let createQuery = `INSERT INTO artist VALUES(NULL, '${row.id}', '${request.body.username}', '${request.body.description}', 'Somewhere', '${request.body.genre_id}')`;
                                db.run(createQuery, function (err) {
                                    if (err) {
                                        return console.log(err.message);
                                    }

                                    if (typeof thumbnailFile != "undefined")
                                    {
                                        thumbnailExtension = thumbnailFile.mimetype.split("/")[1];
                                        if (thumbnailExtension === "png"
                                            || thumbnailExtension === "jpeg"
                                            || thumbnailExtension === "webp") {
                                            thumbnailUploadPath = rootDir + "/public/banner/" + artistRow.id + ".png";
                                        } else if (uploadedFileExtension === "gif") {
                                            thumbnailUploadPath = rootDir + "/public/banner/" + artistRow.id + ".gif";
                                        }

                                        thumbnailFile.mv(thumbnailUploadPath, function (err) {
                                            logMessage("API", `Successfully uploaded thumbnail file (ID: ${artistRow.id}) on server`, 3);
                                        });
                                    }
                                });

                                logMessage("SQL", `INSERT INTO artist VALUES(NULL, '${row.id}', '${request.body.username}', '${request.body.description}', 'Somewhere', '${request.body.genre_id}')`, 2);

                                response.statusCode = 200;
                                response.send(JSON.stringify({ status: "Created artist profile" }));
                                return;
                            }
                        });
                    }
                });
            } else {
                response.statusCode = 404;
                response.send(JSON.stringify({ status: "User not found" }));
                return;
            }
        });
    }
});

module.exports = router;