const geoip = require('geoip-lite');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

const crypto = require('crypto');

const path = require('path');
const fs = require('fs');

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


async function registerNewArtist(username, description, bannerFile, genreId, belongId) {
    return new Promise(function(resolve, reject)
    {
        artistData = {
            data: {
                id: 0,
                username: username,
                description: description,
                bannerFile: bannerFile,
                genreId: genreId,
                belongId: belongId
            },
            errorData: 200
        };

        if (username.length < 3)
        {
            artistData.errorData = 1;
            resolve(artistData);
            return;
        }

        if (username.length > 40)
        {
            artistData.errorData = 2;
            resolve(artistData);
            return;
        }

        if (!bannerFile)
        {
            artistData.errorData = 3;
            resolve(artistData);
            return;
        }

        db.run(`INSERT INTO artist(belong_id, username, description, location, genre) VALUES('${belongId}', '${username}', '${description}', 'Somewhere', '${genreId}')`, function (error) {
            if (error)
            {
                logMessage("API", `FAILED TO INSERT NEW ARTIST CARD`, 3);
            } else {
                const uploadedFileExtension = bannerFile.mimetype.split("/")[1];

                artistData.data.id = this.lastID;

                let uploadPath = "";
                if (uploadedFileExtension === "png"
                    || uploadedFileExtension === "jpeg"
                    || uploadedFileExtension === "webp") {
                    uploadPath = __dirname
                        + "/public/banner/" + artistData.id + ".png";
                } else {
                    artistData.errorData = 4;
                    resolve(artistData);
                    return;
                }

                const pngProfilePic = __dirname
                    + "/public/banner/" + artistData.id + ".png";

                if (fs.existsSync(pngProfilePic)) {
                    fs.unlink(pngProfilePic, () => { });
                }

                try {
                    bannerFile.mv(uploadPath, function (err) {
                        if (err) {
                            artistData.errorData = 5;
                            resolve(artistData);
                            logMessage("API", `FAILED TO UPLOAD BANNER FILE: ${err}`, 3);
                            return;
                        } else {
                            artistData.errorData = 6;
                            resolve(artistData);
                            return;
                        }
                    });
                } catch {

                }

                resolve(artistData);
            }
        });       
    });
}

module.exports.registerNewArtist = registerNewArtist;

async function updateArtistInfo(username, description, genreId, belongId, bannerFile = null)
{
    return new Promise(function(resolve, reject)
    {
        db.get(`SELECT * FROM artist WHERE belong_id='${belongId}'`, function(error, row) {
            if (bannerFile)
            {
                const uploadedFileExtension = bannerFile.mimetype.split("/")[1];
                let uploadPath = "";
                if (uploadedFileExtension === "png"
                    || uploadedFileExtension === "jpeg"
                    || uploadedFileExtension === "webp") {
                    uploadPath = __dirname
                        + "/public/banner/" + row.id + ".png";
                }

                const pngProfilePic = __dirname
                    + "/public/banner/" + row.id + ".png";

                if (fs.existsSync(pngProfilePic)) {
                    fs.unlink(pngProfilePic, () => { });
                }

                try {
                    bannerFile.mv(uploadPath, function (err) {
                        if (err) {
                            logMessage("API", `FAILED TO UPLOAD BANNER FILE: ${err}`, 3);
                        }
                    });
                } catch {

                }
            }

            db.run(`UPDATE artist SET username='${username}', description='${description}', genre='${genreId}' WHERE id=${belongId}`);
            resolve(row);
        });        
    });
};

module.exports.updateArtistInfo = updateArtistInfo;

async function getArtistDataById(artist_id) {
    return new Promise(function(resolve, reject)
    {
        db.get(`SELECT * FROM artist WHERE id='${artist_id}'`, function(err, row) {
            if (typeof row != "undefined")
            {
                db.all(`SELECT * FROM song WHERE artist_id='${row.id}' ORDER BY plays DESC`, function(err, rows) {
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


async function getRecomendationInfo() {
    return new Promise(function(resolve, reject)
    {
        db.all(`SELECT * FROM artist ORDER BY id DESC LIMIT 5`, function(err, newArtists) {
            db.all('SELECT `song`.*, `artist`.`username` FROM `song` INNER JOIN `artist` ON `song`.`artist_id` = `artist`.`id` ORDER BY `song`.`plays` ASC LIMIT 5', function(err, songsList) {
                let recomendData = {
                    newArtists: newArtists,
                    songsList: songsList
                };

                resolve(recomendData);
            });
        });
    });
}
module.exports.getRecomendationInfo = getRecomendationInfo;

async function getArtistDataByBelongId(belong_id) {
    return new Promise(function(resolve, reject)
    {
        db.get(`SELECT * FROM artist WHERE belong_id='${belong_id}'`, function(err, row) {
            if (typeof row != "undefined")
            {
                db.all(`SELECT * FROM song WHERE artist_id='${row.id}' ORDER BY plays DESC`, function(err, rows) {
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

module.exports.getArtistDataByBelongId = getArtistDataByBelongId;

async function getSongInfoById(song_id) {
    return new Promise(function(resolve, reject)
    {
        var query = "SELECT `song`.*, `artist`.`username`, `artist`.`id` AS `artist_id`, `artist`.`description` AS `artist_description` FROM `song` INNER JOIN `artist` ON `song`.`artist_id` = `artist`.`id` WHERE `song`.`id`=\'" + song_id + "\'";
        db.get(query, function(err, row) {
            if (typeof row != "undefined")
            {
                resolve(row);
            } else {
                resolve(null);
            }
        });
    });
}

module.exports.getSongInfoById = getSongInfoById;

async function getListOfGenres() {
    return new Promise(function(resolve, reject)
    {
        db.all(`SELECT * FROM genre`, function(err, rows) {
            if (typeof rows != "undefined")
            {
                resolve(rows);
            } else {
                resolve(null);
            }
        });
    });
};

module.exports.getListOfGenres = getListOfGenres;