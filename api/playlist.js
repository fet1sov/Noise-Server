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

function logMessage(tag, message, type) {
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

router.get('/fetch/:authorId', function (request, response) {
    if (request.params.authorId)
    {
        logMessage("API [PLAYLISTS]", "Got a request fetching by UID: " + request.params.authorId, 0);
        let query = `SELECT * FROM playlist WHERE user_id='${request.params.authorId}'`;
        db.all(query, function(err, rows) {
            if (typeof rows != "undefined")
            {
                if (rows.length != 0)
                {
                    let playList = [];

                    for (let i = 0; i < rows.length; i++) 
                    {
                        let songsList = rows[i].songs_id.split("|");
                        for (let j = 0; j < songsList.length; j++)
                        {
                            songsList[j] = Number(songsList[j]);
                        }

                        let playlistThumbnailFile = "";
                        if (fs.existsSync(rootDir + "/public/playlistThumbs/" + rows[i].id + ".png")) {
                            playlistThumbnailFile = `/playlistThumbs/${rows[i].id}.png`;
                        } else if (fs.existsSync(rootDir + "/public/playlistThumbs/" + rows[i].id + ".gif")) {
                            playlistThumbnailFile = `/playlistThumbs/${rows[i].id}.gif`;
                        }

                        let playlistData = {
                            id: rows[i].id,
                            user_id: rows[i].user_id,
                            songs_id: songsList,
                            name: rows[i].name,
                            description: rows[i].description,
                            playlistThumb: playlistThumbnailFile,
                        };

                        playList.push(playlistData);
                        if (i === rows.length - 1) {
                            response.statusCode = 200;
                            response.send(JSON.stringify(playList));
                            return;
                        }
                    }
                } else {
                    response.statusCode = 404;
                    response.send(JSON.stringify({ status: "Didn't find any playlists"}));
                    return;
                }
            }
        });
    } else {
        response.statusCode = 404;
        response.send(JSON.stringify({ status: "Invalid userId"}));
        return;
    }
});

router.get('/info/:playlistId', function (request, response) {
    if (request.params.playlistId)
    {
        let query = `SELECT * FROM playlist WHERE id='${request.params.playlistId}'`;
        db.get(query, function(err, row) {
            if (typeof row != "undefined")
            {
                let songsList = row.songs_id.split("|");
                for (let j = 0; j < songsList.length; j++) {
                    songsList[j] = Number(songsList[j]);
                }

                let playlistThumbnailFile = "";
                if (fs.existsSync(rootDir + "/public/playlistThumbs/" + row.id + ".png")) {
                    playlistThumbnailFile = `/playlistThumbs/${row.id}.png`;
                } else if (fs.existsSync(rootDir + "/public/playlistThumbs/" + row.id + ".gif")) {
                    playlistThumbnailFile = `/playlistThumbs/${row.id}.gif`;
                }

                let playlistData = {
                    id: row.id,
                    user_id: row.user_id,
                    songs_id: songsList,
                    name: row.name,
                    description: row.description,
                    playlistThumb: playlistThumbnailFile,
                };

                response.statusCode = 200;
                response.send(JSON.stringify(playlistData));
                return;
            } else {
                response.statusCode = 404;
                response.send(JSON.stringify({ status: "Playlist not found" }));
                return;
            }
        });
    }
});

router.post('/edit/:playlistId', function (request, response) {
    if (request.params.playlistId)
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

        let userQuery = `SELECT * FROM user WHERE session_token='${request.body.session_token}'`;
        db.get(userQuery, function(err, userRow)
        {
            logMessage("API [PLAYLISTS]", "Editing playlist: " + request.params.playlistId, 2);
            let query = `SELECT * FROM playlist WHERE id='${request.params.playlistId}'`;
            db.get(query, function(err, playlist)
            {
                if (typeof userRow != "undefined")
                {
                    if (typeof playlist != "undefined")
                    {
                        if (userRow.id == playlist.user_id)
                        {
                            if (typeof thumbnailFile != "undefined")
                            {
                                fs.unlink(thumbnailUploadPath, () => {});
                                thumbnailExtension = thumbnailFile.mimetype.split("/")[1];
                                if (thumbnailExtension === "png"
                                    || thumbnailExtension === "jpeg"
                                    || thumbnailExtension === "webp") {
                                    thumbnailUploadPath = rootDir + "/public/playlistThumbs/" + playlist.id + ".png";
                                } else if (uploadedFileExtension === "gif") {
                                    thumbnailUploadPath = rootDir + "/public/playlistThumbs/" + playlist.id + ".gif";
                                }

                                thumbnailFile.mv(thumbnailUploadPath, function (err) {
                                    logMessage("API", `Successfully uploaded thumbnail file (ID: ${playlist.id}) on server`, 3);
                                });
                            }

                            let updateQuery = ``;
                            if (!request.body.songsList)
                            {
                                updateQuery = `UPDATE playlist SET name='${request.body.name}', description='${request.body.description}' WHERE id='${playlist.id}'`;
                            } else {
                                updateQuery = `UPDATE playlist SET name='${request.body.name}', description='${request.body.description}', songs_id='${request.body.songsList}' WHERE id='${playlist.id}'`;
                            }
                            db.run(updateQuery);
                            
                            response.statusCode = 200;
                            response.send(JSON.stringify({ status: "Edited the playlist" }));
                            return;
                        }
                    } else {
                        let createQuery = `INSERT INTO playlist VALUES(NULL, '${userRow.id}', '', '${request.body.name}', '${request.body.description}')`;
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
                                    thumbnailUploadPath = rootDir + "/public/playlistThumbs/" + this.lastID + ".png";
                                } else if (uploadedFileExtension === "gif") {
                                    thumbnailUploadPath = rootDir + "/public/playlistThumbs/" + this.lastID + ".gif";
                                }

                                thumbnailFile.mv(thumbnailUploadPath, function (err) {
                                    logMessage("API", `Successfully uploaded thumbnail file (ID: ${this.lastID}) on server`, 3);
                                });
                            }
                        });

                        response.statusCode = 200;
                        response.send(JSON.stringify({ status: "Created a playlist" }));
                        return;
                    }
                } else {
                    response.statusCode = 503;
                    response.send(JSON.stringify({ status: "User not found" }));
                    return;
                }
            });
        });
    }
});

router.post('/addsong/:playlistId', function (request, response) {
    if (request.params.playlistId)
    {
        let userQuery = `SELECT * FROM user WHERE session_token='${request.body.session_token}'`;
        db.get(userQuery, function(err, userRow)
        {
            logMessage("API [PLAYLISTS]", "Adding the song to: " + request.params.playlistId, 2);
            let query = `SELECT * FROM playlist WHERE id='${request.params.playlistId}'`;
            db.get(query, function(err, row)
            {
                if (typeof row != "undefined")
                {
                    if (userRow.id === row.user_id)
                    {
                        let songsList = rows[i].songs_id.split("|");
                        songsList.push(`${request.body.songId}`);
                        db.run(`UPDATE playlist SET songs_id='${songsList.join("|")}'`);

                        response.statusCode = 200;
                        response.send(JSON.stringify({ status: "Added song to playlist" }));
                        return;
                    } else {
                        response.statusCode = 503;
                        response.send(JSON.stringify({ status: "Don't have access to this playlist" }));
                        return;
                    }
                    
                } else {
                    response.statusCode = 404;
                    response.send(JSON.stringify({ status: "Playlist" }));
                    return;
                }
            });
        });
    } else {
        response.statusCode = 404;
        response.send(JSON.stringify({ status: "Invalid userId"}));
        return;
    }
});

Array.prototype.remove = function(index) {
    this.splice(index, 1);
}

router.post('/delsong/:playlistId', function (request, response) {
    if (request.params.playlistId)
    {
        let userQuery = `SELECT * FROM user WHERE session_token='${request.body.session_token}'`;
        db.get(userQuery, function(err, userRow)
        {
            logMessage("API [PLAYLISTS]", "Adding the song to: " + request.params.playlistId, 2);
            let query = `SELECT * FROM playlist WHERE id='${request.params.playlistId}'`;
            db.get(query, function(err, row)
            {
                if (typeof row != "undefined")
                {
                    if (userRow.id === row.user_id)
                    {
                        let songsList = rows[i].songs_id.split("|");
                        songsList.remove(songsList.indexOf(`${request.body.songId}`));
                        db.run(`UPDATE playlist SET songs_id='${songsList.join("|")}'`);

                        response.statusCode = 200;
                        response.send(JSON.stringify({ status: "Added song to playlist" }));
                        return;
                    } else {
                        response.statusCode = 503;
                        response.send(JSON.stringify({ status: "Don't have access to this playlist" }));
                        return;
                    }
                    
                } else {
                    response.statusCode = 404;
                    response.send(JSON.stringify({ status: "Playlist" }));
                    return;
                }
            });
        });
    } else {
        response.statusCode = 404;
        response.send(JSON.stringify({ status: "Invalid userId"}));
        return;
    }
});

module.exports = router;