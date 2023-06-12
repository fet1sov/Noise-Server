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

router.get('/songlist/:artistId', function (request, response) {
    if (request.params.artistId)
    {
        let query = `SELECT * FROM song WHERE artist_id='${request.params.artistId}'`;
        db.all(query, function(err, rows) {
        if (rows.length != 0)
        {
                let songsList = [];
                for(let i = 0; i < rows.length; i++)
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
                        }
                    });
                }
            } else {
                response.send(JSON.stringify({ status: "Didn't found any song from this artist" }));
                response.statusCode = 404;
                return;
            }
        });
    } else {
        response.send(JSON.stringify({ status: "Invalid artistId param" }));
        response.statusCode = 505;
        return;
    }
});

module.exports = router;