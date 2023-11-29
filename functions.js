const geoip = require('geoip-lite');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

const crypto = require('crypto');

const path = require('path');
const fs = require('fs');

const rootDir = path.join(__dirname, '..');

exports.getLocaleByIP = (ip) => {
    var region = geoip.lookup(ip);

    var localeContent = "";
    var localeJSON = "";

    if (region)
    {
        localeContent = fs.readFileSync(`${__dirname}/views/locales/${region.country}`, 'utf8');
        localeJSON = JSON.parse(localeContent);
    } else {
        localeContent = fs.readFileSync(`${__dirname}/views/locales/ru-RU.json`, 'utf8');
        localeJSON = JSON.parse(localeContent);
    }

    return localeJSON;
};

async function authUser(username, password) {
    return new Promise(function(resolve, reject)
    {
        userData = {
            data: null,
            errorData: 200
        };

        db.get(`SELECT * FROM user WHERE login='${username}'`, function(err, row) {
            if (typeof row != "undefined")
            {
                let passMD5 = crypto.createHash('md5').update(password).digest('hex');

                if (row.password == passMD5)
                {
                    userData.data = row;
                } else {
                    userData.errorData = 400;
                }

                resolve(userData);
            } else {
                resolve(null);
            }
        });
    });
};

module.exports.authUser = authUser;

async function getArtistDataById(artist_id) {
    return new Promise(function(resolve, reject)
    {
        db.get(`SELECT * FROM artist WHERE id='${artist_id}'`, function(err, row) {
            if (typeof row != "undefined")
            {
                db.all(`SELECT * FROM song WHERE artist_id='${artist_id}' ORDER BY plays DESC`, function(err, rows) {
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
                        banner: bannerURL,
                        songsList: rows
                    };

                    resolve(artistData);
                });
            } else {
                resolve(null);
            }
        });
    });
};

module.exports.getArtistDataById = getArtistDataById;