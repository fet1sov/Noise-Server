const express = require('express');
const fileUpload = require("express-fileupload");

const router = express.Router(),
    bodyParser = require('body-parser');

const path = require('path');
const fs = require('fs');

const customConsole = require("../utils/console.js");

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

const rootDir = path.join(__dirname, '..');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(fileUpload());

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

router.get('/fetch/:songid', function (request, response) {
    if (request.params.songid != "all")
    {
        let songQuery = `SELECT * FROM song WHERE id='${request.params.songid}'`;
        logMessage(`SQL`, `Query: ${songQuery}`, 0);
        
        db.get(songQuery, function(err, row)
        {
            if (typeof row != "undefined")
            {
                let thumbnail = "";
                if (fs.existsSync(rootDir + "/public/thumbnails/" + request.params.songid + ".png")) {
                    thumbnail = `/thumbnails/${request.params.songid}.png`;
                } else if (fs.existsSync(rootDir + "/public/thumbnails/" + request.params.songid + ".gif")) {
                    thumbnail = `/thumbnails/${request.params.songid}.gif`;
                }

                db.get(`SELECT * FROM artist WHERE id='${row.artist_id}'`, function(err, artistRow) {
                    if (typeof artistRow != "undefined")
                    {
                        let songData = {
                            id: row.id,
                            artist_name: artistRow.username,
                            name: row.name,
                            path: `/songs/${row.id}.mp3`,
                            thumbnail_path: thumbnail,
                            publication_date: row.publication_date,
                            genre: row.genre,
                            plays: row.plays,
                            length: 0,
                        };
        
                        response.statusCode = 200;
                        response.send(JSON.stringify(songData));
                        return;
                    }
                });
            } else {
                response.statusCode = 404;
                response.send(JSON.stringify({ status: "Didn't found this song" }))
                return;
            }
        });
    } else {
        const songQuery = `SELECT * FROM song`;
        logMessage(`SQL`, `Query: ${songQuery}`, 0);

        db.all(songQuery, function (err, rows) {
            if (typeof rows != "undefined")
            {
                let songsList = [];
                for (let i = 0; i < rows.length; i++)
                {
                    let thumbnail = "";
                    if (fs.existsSync(rootDir + "/public/thumbnails/" + rows[i].id + ".png")) {
                        thumbnail = `/thumbnails/${rows[i].id}.png`;
                    } else if (fs.existsSync(rootDir + "/public/thumbnails/" + rows[i].id + ".gif")) {
                        thumbnail = `/thumbnails/${rows[i].id}.gif`;
                    }

                    db.get(`SELECT * FROM artist WHERE id='${rows[i].artist_id}'`, function(err, artistRow) {
                        if (typeof artistRow != "undefined")
                        {
                            let songData = {
                                id: rows[i].id,
                                artist_name: artistRow.username,
                                name: rows[i].name,
                                path: `/songs/${rows[i].id}.mp3`,
                                thumbnail_path: thumbnail,
                                publication_date: rows[i].publication_date,
                                genre: rows[i].genre,
                                plays: rows[i].plays,
                                length: 0,
                            };

                            songsList.push(songData);

                            if (i === rows.length - 1)
                            {
                                response.statusCode = 200;
                                response.send(JSON.stringify(songsList));
                                return;
                            }
                        } else {
                            
                        }
                    });
                }
            } else {
                response.statusCode = 404;
                response.send(JSON.stringify({ status: "Songs database is empty"}));
                return;
            }
        });
    }
});

router.get("/play/:songid", function (request, response) {
    if (request.params.songid)
    {
        const songQuery = `SELECT * FROM song WHERE id='${request.params.songid}'`;
        logMessage(`SQL`, `Query: ${songQuery}`, 0);
        
        db.get(songQuery, function(err, row)
        {
            if (typeof row != "undefined")
            {
                db.get(`SELECT * FROM artist WHERE artist_id='${row.artist_id}'`, function(err, artistRow) {
                    if (typeof artistRow != "undefined")
                    {
                        let songData = {
                            id: row.id,
                            artist_name: artistRow.name,
                            name: row.name,
                            path: `/songs/${row.id}.png`,
                            thumbnail_path: thumbnail,
                            plays: row.plays++
                        };

                        db.run(`UPDATE song SET plays=${row.plays++} WHERE id='${request.params.songid}'`);

                        response.statusCode = 200;
                        response.send(JSON.stringify(songData));
                        return;
                    }
                });
            } else {
                response.statusCode = 404;
                response.send(JSON.stringify({ status: "Didn't found this song" }));
                return;
            }
        });
    }
});

router.post('/upload', function (request, response) {
    if (request.body.session_token) 
    {
        if (request.files && Object.keys(request.files).length !== 0) 
        {
            const thumbnailFile = request.files.thumbnail;
            const songFile = request.files.song;
            if (thumbnailFile && songFile)
            {
                let accessToken = request.body.session_token;
                let query = `SELECT * FROM users WHERE session_token='${accessToken}'`;

                db.get(query, function(err, row) {
                    if (typeof row != "undefined")
                    {
                        let uploadPath = "";
                        db.run(`INSERT INTO song VALUES (NULL, '${row.id}', '${request.body.songTitle}', ${request.body.length}, '${Date.now()}', '${genre}', '0')`, function(err) {
                            if (err) {
                                return console.log(err.message);
                            }
                            logMessage("API", `Proccesing upload a song with ID ${this.lastID}`, 0);

                            let songUploadPath = rootDir + "/public/songs/" + this.lastID + ".mp3";
                            let thumbnailUploadPath = "";

                            let thumbnailExtension = "";
                            thumbnailExtension = thumbnailFile.mimetype.split("/")[1];

                            if (thumbnailExtension === "png" 
                            || thumbnailExtension === "jpeg" 
                            || thumbnailExtension === "webp")
                            {
                                thumbnailUploadPath = rootDir + "/public/thumbnails/" + this.lastID + ".png";
                            } else if (uploadedFileExtension === "gif") {
                                thumbnailUploadPath = rootDir + "/public/thumbnails/" + this.lastID + ".gif";
                            }

                            try {
                                songFile.mv(songUploadPath, function (err) {
                                    logMessage("API", `Successfully uploaded songfile (ID: ${this.lastID}) on server`, 3);
                                });

                                thumbnailFile.mv(thumbnailUploadPath, function (err) {
                                    logMessage("API", `Successfully uploaded thumbnail file (ID: ${this.lastID}) on server`, 3);
                                });
                            } catch {
                                logMessage("API", "Failed with upload song on the server", 3);
                            }
                        });
                    }
                });
            }
        }
    }
});

module.exports = router;