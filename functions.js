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

async function registerUser(username, email, password, repeatPassword) {
    return new Promise(function(resolve, reject)
    {
        userData = {
            errorData: 200
        };

        if (password != repeatPassword)
        {
            userData.errorData = 406;
            resolve(userData);
            return;
        }

        if (username.length < 3)
        {
            userData.errorData = 401;
            resolve(userData);
            return;
        }

        if (username.length > 40)
        {
            userData.errorData = 402;
            resolve(userData);
            return;
        }

        if (!(/^[A-Za-z0-9]*$/.test(username))) 
        {
            userData.errorData = 403;
            resolve(userData);
            return;
        }

        db.get(`SELECT * FROM user WHERE UPPER(login) LIKE UPPER('${username}')`, function (err, row) {
            if (typeof row != "undefined") {
                userData.errorData = 404;
                resolve(userData);
                return;
            } else {
                db.get(`SELECT * FROM user WHERE UPPER(email) LIKE UPPER('${email}')`, function(err, row)
                {
                    if (typeof row != "undefined")
                    {
                        userData.errorData = 405;
                        resolve(userData);
                        return;
                    } else {
                        let accessToken = '';

                        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                        let charactersLength = characters.length;
                        for (let i = 0; i < 33; i++) {
                            accessToken += characters.charAt(Math.floor(Math.random() * charactersLength));
                        }

                        let passMD5 = crypto.createHash('md5').update(password).digest('hex');

                        db.run(`INSERT INTO user VALUES(NULL, '${accessToken}', '${username}', '${passMD5}', '${email.trim()}', '0', '0')`);                       
                        resolve(userData);
                        return;
                    }
                });
            }
        });

    });
};

module.exports.registerUser = registerUser;

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