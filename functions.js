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
    console.log(ip);
    let region = geoip.lookup(ip);

    let localeContent = "";
    let localeJSON = "";

    if (region &&
    (
    region.country == "RU"
    || region.country == "BY"
    ))
    {
        localeContent = fs.readFileSync(`${__dirname}/views/locales/ru-RU.json`, 'utf8');
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

                    if (!row.role_id)
                    {
                        resolve(userData);
                    } else {
                        db.get(`SELECT * FROM role WHERE role_id='${row.role_id}'`, function(err, roleData) {
                            if (typeof roleData != "undefined")
                            {
                                if (roleData.is_admin)
                                {
                                    userData.data.admin = roleData.is_admin;
                                }

                                resolve(userData);
                            } else {
                                resolve(userData);
                            }
                        });
                    }
                } else {
                    userData.errorData = 400;
                    resolve(userData);
                }
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

async function registerNewArtist(username, description, genreId, belongId, bannerFile = null) {
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
                if (bannerFile)
                {
                    const uploadedFileExtension = bannerFile.mimetype.split("/")[1];

                    artistData.data.id = this.lastID;

                    let uploadPath = "";
                    if (uploadedFileExtension === "png"
                        || uploadedFileExtension === "jpeg"
                        || uploadedFileExtension === "webp") {
                        uploadPath = __dirname
                            + "/public/banner/" + artistData.data.id + ".png";
                    } else {
                        artistData.errorData = 4;
                        resolve(artistData);
                        return;
                    }

                    const pngProfilePic = __dirname
                        + "/public/banner/" + artistData.data.id + ".png";

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
                            }
                        });
                    } catch {

                    }

                    resolve(artistData);
                }
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

            db.run(`UPDATE artist SET username='${username}', description='${description}', genre='${genreId}' WHERE id=${row.id}`);
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
                db.all(`SELECT * FROM song WHERE artist_id='${row.id}' ORDER BY plays ASC`, function(err, rows) {
                    let bannerURL = "";
                    if (fs.existsSync(rootDir + "/public/banner/" + row.id + ".png")) {
                        bannerURL = `/banner/${row.id}.png`;
                    } else if (fs.existsSync(rootDir + "/public/banner/" + row.id + ".gif")) {
                        bannerURL = `/banner/${row.id}.gif`;
                    }

                    let songLists = rows;
                    let artistData = {
                        id: row.id,
                        belong_id: row.belong_id,
                        username: row.username,
                        description: row.description,
                        location: row.location,
                        genre: row.genre,
                        banner: bannerURL,
                        songsList: songLists
                    };

                    artistData.lastRelease = rows.sort(function(x, y){
                        return y.publication_date - x.publication_date;
                    })[0];

                    resolve(artistData);
                });
            } else {
                resolve(null);
            }
        });
    });
};

module.exports.getArtistDataById = getArtistDataById;


async function getProfileByUsername(username) {
    return new Promise(function(resolve, reject)
    {
        let userData = {
            artistData: null,
            userData: null,
            playlistData: null
        }

        if (!username.startsWith("id"))
        {
            db.get(`SELECT * FROM user WHERE user.login='${username}'`, function(err, row) {
                if (typeof row != "undefined")
                {
                    userData.userData = row;

                    db.get(`SELECT * FROM artist WHERE belong_id='${row.id}'`, function(err, artistRow) {
                        if (typeof artistRow != "undefined")
                        {
                            userData.artistData = artistRow;
                        }

                        db.all(`SELECT * FROM playlist WHERE user_id='${row.id}'`, function(err, playListRows) {
                            if (typeof playListRows != "undefined")
                            {
                                userData.playlistData = playListRows;
                            }
                            resolve(userData);
                        });
                    });
                } else {
                    resolve(null);
                }
            });
        } else {
            db.get(`SELECT * FROM user WHERE id='${username.slice(2)}'`, function(err, row) {
                if (typeof row != "undefined")
                {
                    userData.userData = row;

                    db.get(`SELECT * FROM artist WHERE belong_id='${row.id}'`, function(err, artistRow) {
                        if (typeof artistRow != "undefined")
                        {
                            userData.artistData = artistRow;
                        }

                        db.all(`SELECT * FROM playlist WHERE user_id='${row.id}'`, function(err, playListRows) {
                            if (typeof playListRows != "undefined")
                            {
                                userData.playlistData = playListRows;
                            }

                            resolve(userData);
                        });
                    });
                } else {
                    resolve(null);
                }
            });
        }

    });
}

module.exports.getProfileByUsername = getProfileByUsername;

async function getRecomendationInfo(user_id) {
    return new Promise(function(resolve, reject)
    {
        db.all(`SELECT * FROM artist ORDER BY id DESC LIMIT 5`, function(err, newArtists) {
            db.all('SELECT `song`.*, `artist`.`username` FROM `song` INNER JOIN `artist` ON `song`.`artist_id` = `artist`.`id` ORDER BY `song`.`plays` DESC LIMIT 5', function(err, songsList) {
                    db.all(`SELECT * FROM playlist WHERE user_id = '${user_id}' LIMIT 5`, function(err, playlist) {
                        let recomendData = {
                            newArtists: newArtists,
                            songsList: songsList,
                            playlistList: playlist
                        };
        
                        resolve(recomendData);
                    });
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
                        songsList: rows,
                        lastRelease: rows.sort(function(x, y){
                            return x.timestamp - y.timestamp;
                        })[0]
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

async function getPlaylistInfoById(playlist_id) {
    return new Promise(function(resolve, reject)
    {
        let playlistData = {
            playlist: null,
            songList: [],
        };

        db.get(`SELECT playlist.*, user.id AS author_id, user.login AS author_username FROM playlist INNER JOIN user ON playlist.user_id = user.id WHERE playlist.id='${playlist_id}'`, function(err, row) {
            if (typeof row != "undefined")
            {
                playlistData.playlist = row;
                playlistData.songList = row.songs_id.split("|");

                db.all(`SELECT song.*, artist.username AS artist_name FROM song INNER JOIN artist ON song.artist_id = artist.id WHERE song.id IN (${playlistData.songList.join(", ")})`, function (err, songs) {
                    playlistData.songList = songs;
                    resolve(playlistData);
                });

            } else {
                resolve(null)
            }
        });
    });
}

module.exports.getPlaylistInfoById = getPlaylistInfoById;

async function getSongInfoById(song_id) {
    return new Promise(function(resolve, reject)
    {
        let query = "SELECT `song`.*, `artist`.`username`, `artist`.`id` AS `artist_id`, `artist`.`description` AS `artist_description` FROM `song` INNER JOIN `artist` ON `song`.`artist_id` = `artist`.`id` WHERE `song`.`id`=\'" + song_id + "\'";
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

async function uploadSoundTrack(artistId, name, thumbnailFile, songFile, genreId) {
    return new Promise(function(resolve, reject)
    {
        db.run(`INSERT INTO song(publication_date, artist_id, name, genre) VALUES('${Date.now()}', '${artistId}', '${name}', '${genreId}')`, function (error) {
            if (error)
            {
                console.log(`FAILED TO INSERT NEW SOUND TRACK ${error}`);
            } else {

                if (thumbnailFile)
                {
                    const uploadedFileExtension = thumbnailFile.mimetype.split("/")[1];
                    let uploadPath = "";
                    if (uploadedFileExtension === "png"
                        || uploadedFileExtension === "jpeg"
                        || uploadedFileExtension === "webp") {
                        uploadPath = __dirname
                            + "/public/thumbnails/" + this.lastID + ".png";
                    }

                    try {
                        thumbnailFile.mv(uploadPath, function (err) {
                            if (err) {
                                console.log(`FAILED TO UPLOAD BANNER FILE: ${err}`);
                            } else {

                            }
                        });
                    } catch {

                    }
                }

                if (songFile)
                {
                    const songFileExtension = songFile.mimetype.split("/")[1];
                    let songUploadPath = "";
                    if (songFileExtension === "mp3"
                        || songFileExtension === "mpeg"
                        || songFileExtension === "flac") {
                        songUploadPath = __dirname
                        + "/public/songs/" + this.lastID + ".mp3";
                    }

                    try {
                        songFile.mv(songUploadPath, function (err) {
                            if (err) {
                                console.log(`FAILED TO UPLOAD SONG FILE: ${err}`);
                            } else {

                            }
                        });
                    } catch {

                    }
                }

                resolve(this.lastID);
            }
        });
    });
};

module.exports.uploadSoundTrack = uploadSoundTrack;

async function updateSongById(songId, name, genreId, fileList) {
    return new Promise(function(resolve, reject)
    {
        db.run(`UPDATE song SET name = '${name}', genre = '${genreId}' WHERE id='${songId}' `, function (error) {
            if (error)
            {
                console.log(`FAILED TO UPDATE SOUND TRACK ${error}`);
            } else {
                if (fileList)
                {
                    const uploadedFileExtension = fileList.songThumbnail.mimetype.split("/")[1];

                    let uploadPath = "";
                    if (uploadedFileExtension === "png"
                        || uploadedFileExtension === "jpeg"
                        || uploadedFileExtension === "webp") {
                        uploadPath = __dirname
                            + "/public/thumbnails/" + songId + ".png";
                    }

                    if (fs.existsSync(uploadPath)) {
                        fs.unlink(uploadPath, () => { });
                    }

                    try {
                        fileList.songThumbnail.mv(uploadPath, function (err) {
                            if (err) {
                                console.log(`FAILED TO UPLOAD BANNER FILE: ${err}`);
                            } else {

                            }
                        });
                    } catch {

                    }
                }

                resolve(songId);
            }
        });
    });
};

module.exports.updateSongById = updateSongById;

async function getSongsForPaginationArtist(artistId, songsPerPage, page) {
    return new Promise(function(resolve, reject)
    {
        db.all(`SELECT * FROM song WHERE artist_id='${artistId}' ORDER BY plays DESC LIMIT ${songsPerPage} OFFSET ${(page - 1) * songsPerPage}`, function(err, rows) {
            resolve(rows);
        });
    });
}
module.exports.getSongsForPaginationArtist = getSongsForPaginationArtist;

async function incrementPlaysCount(songId) {
    return new Promise(function(resolve, reject)
    {
        db.get(`SELECT * FROM song WHERE id='${songId}'`, function(err, row) {
            if (typeof row != "undefined")
            {
                let songPlays = row.plays + 1;
                db.run(`UPDATE song SET plays='${songPlays}' WHERE id='${songId}' `, function (error) {

                });
            }

            resolve(null);
        });
    });
}

module.exports.incrementPlaysCount = incrementPlaysCount;

async function proceedSearchByTerm(searchTerm) {
    return new Promise(function(resolve, reject) {
        // INNER JOIN sucks >_<
        db.all(`SELECT *, SUBSTRING(artist.username, 0, 22) as trimmed_name FROM artist WHERE LOWER(username) LIKE '${searchTerm.toLowerCase()}%' LIMIT 10`, function(err, artistList) {
            db.all(`SELECT song.*, SUBSTRING(song.name, 0, 22) as trimmed_name, artist.username AS artist_name FROM song INNER JOIN artist ON song.artist_id = artist.id WHERE name LIKE '${searchTerm}%' OR artist_name LIKE '${searchTerm}%' ORDER BY plays ASC LIMIT 10`, function(err, songList) {
                db.all(`SELECT * FROM playlist WHERE LOWER(name) LIKE '${searchTerm.toLowerCase()}%' LIMIT 10`, function(err, playlistList) {
                    db.all(`SELECT * FROM user WHERE LOWER(login) LIKE '${searchTerm.toLowerCase()}%' LIMIT 10`, function(err, profilesList) {
                        let searchResult = {
                            artistList: artistList,
                            songList: songList,
                            playlistList: playlistList,
                            profilesList: profilesList,
                        }

                        resolve(searchResult);
                    });
                });
            });
        });
    });
}

module.exports.proceedSearchByTerm = proceedSearchByTerm;

async function deleteSongList(authorId, songList) {
    return new Promise(function(resolve, reject)
    {
        songList = songList.split(", ");

        for (let i = 0; i < songList.length; i++)
        {
            if (fs.existsSync("/public/thumbnails/" + i + ".png")) {
                fs.unlink("/public/thumbnails/" + i + ".png", () => { });
            }

            if (fs.existsSync("/public/songs/" + i + ".mp3")) {
                fs.unlink("/public/songs/" + i + ".mp3", () => { });
            }
        }

        db.run(`DELETE FROM song WHERE id IN (${songList.join(", ")}) AND artist_id = '${authorId}'`, function (error) {
            if (error)
            {
                console.log(`FAILED TO DELETE SOUND TRACK(-s): ${error}`);
            }
        });

        resolve(null);
    });
}

module.exports.deleteSongList = deleteSongList;

async function createPlaylist(authorId, playlistName, playlistDescription, playlistImg) {
    return new Promise(function(resolve, reject)
    {
        db.run(`INSERT INTO playlist (user_id, songs_id, name, description) VALUES(${authorId}, '', '${playlistName}', '${playlistDescription}')`, function (error) {
            if (error)
            {
                console.log(`FAILED TO DELETE SOUND TRACK(-s): ${error}`);
            } else {
                if (playlistImg)
                {
                    const uploadedFileExtension = playlistImg.mimetype.split("/")[1];

                    let uploadPath = "";
                    if (uploadedFileExtension === "png"
                        || uploadedFileExtension === "jpeg"
                        || uploadedFileExtension === "webp") {
                        uploadPath = __dirname
                            + "/public/playlistThumbs/" + this.lastID + ".png";
                    }

                    if (fs.existsSync(uploadPath)) {
                        fs.unlink(uploadPath, () => { });
                    }

                    try {
                        playlistImg.mv(uploadPath, function (err) {
                            if (err) {
                                console.log(`FAILED TO UPLOAD BANNER FILE: ${err}`);
                            } else {

                            }
                        });
                    } catch {

                    }
                }

                resolve(this.lastID);
            }
        });
    });
}

module.exports.createPlaylist = createPlaylist;

async function getAdminInfo() {
    return new Promise(function(resolve, reject)
    {
        let adminInfo = {
            userList: [],
            artistList: [],
            songList: [],
            reportList: [],
        }

        db.all(`SELECT * FROM user`, function(err, userList) {
            db.all(`SELECT * FROM artist`, function(err, artistList) {
                db.all(`SELECT * FROM song`, function(err, songList) {
                    db.all(`SELECT report.*, artist.username AS artist_name, user.login AS user_name FROM report INNER JOIN artist ON report.suspect_id = artist.id INNER JOIN user ON report.author_id = user.id WHERE active = '1'`, function(err, reportList) {
                        adminInfo.userList = userList;
                        adminInfo.artistList = artistList;
                        adminInfo.songList = songList;
                        adminInfo.reportList = reportList;
                        resolve(adminInfo);
                    });
                });
            });
        });
    });
}

module.exports.getAdminInfo = getAdminInfo;

async function getReportInfoById(report_id) {
    return new Promise(function(resolve, reject)
    {
        db.get(`SELECT report.*, artist.username AS artist_name, user.login AS user_name FROM report INNER JOIN artist ON report.suspect_id = artist.id INNER JOIN user ON report.author_id = user.id WHERE report.id = '${report_id}'`, function(err, reportList) {
            resolve(reportList);
        });
    });
}

module.exports.getReportInfoById = getReportInfoById;

async function getUserList() {
    return new Promise(function(resolve, reject)
    {
        db.all(`SELECT * FROM user`, function(err, userList) {
            resolve(userList);
        });
    });
}

module.exports.getUserList = getUserList;

async function getUsersListForPagination(usersPerPage, currentPage) {
    return new Promise(function(resolve, reject)
    {
        db.all(`SELECT * FROM user LIMIT ${usersPerPage} OFFSET ${currentPage * usersPerPage}`, function(err, userList) {
            resolve(userList);
        });
    });
}

module.exports.getUsersListForPagination = getUsersListForPagination;

async function searchUserByLogin(search_term, usersPerPage, currentPage) {
    return new Promise(function(resolve, reject)
    {
        db.all(`SELECT * FROM user WHERE user.login LIKE '${search_term}%' LIMIT ${usersPerPage} OFFSET ${(currentPage - 1) * usersPerPage}`, function(err, userList) {
            resolve(userList);
        });
    });
}

module.exports.searchUserByLogin = searchUserByLogin;

async function fetchPlaylists(user_id) {
    return new Promise(function(resolve, reject)
    {
        db.all(`SELECT * FROM playlist WHERE user_id = '${user_id}'`, function(err, userList) {
            resolve(userList);
        });
    });
}

module.exports.fetchPlaylists = fetchPlaylists;

async function fetchPlaylistsForPagination(user_id, playlistPerPage, currentPage) {
    return new Promise(function(resolve, reject)
    {
        db.all(`SELECT * FROM playlist WHERE user_id = '${user_id}' LIMIT ${playlistPerPage} OFFSET ${(currentPage - 1) * playlistPerPage}`, function(err, userList) {
            resolve(userList);
        });
    });
}

module.exports.fetchPlaylistsForPagination = fetchPlaylistsForPagination;

async function setReportInactive(report_id) {
    return new Promise(function(resolve, reject)
    {
        db.run(`UPDATE report SET active='0' WHERE report.id = '${report_id}'`, (error) => {
            if (error)
            {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

module.exports.setReportInactive = setReportInactive;

async function addSongToPlaylist(userId, playlistId, songAddId) {
    return new Promise(function(resolve, reject)
    {
        db.get(`SELECT playlist.*, user.id AS author_id, user.login AS author_username FROM playlist INNER JOIN user ON playlist.user_id = user.id WHERE playlist.id='${playlistId}'`, function(err, row) {
            if (typeof row != "undefined")
            {
                if (userId == row.user_id)
                {
                    let songList = [];

                    if (row.songs_id.length)
                    {
                        songList = row.songs_id.split("|");
                    }

                    if (!songList.includes(songAddId))
                    {
                        songList.push(songAddId);
                        songList = songList.join("|");

                        db.run(`UPDATE playlist SET songs_id='${songList}' WHERE playlist.id='${row.id}'`);
                        resolve(true);
                    } else {
                        resolve(true);
                    }
                } else {
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        });
    });
}

module.exports.addSongToPlaylist = addSongToPlaylist;

async function reportTheArtist(author_id, suspect_id, reason, description) {
    return new Promise(function(resolve, reject)
    {
        db.run(`INSERT INTO report(author_id, suspect_id, reason, description) VALUES('${author_id}', '${suspect_id}', '${reason}', '${description}')`, (error) => {
            if (error)
            {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

module.exports.reportTheArtist = reportTheArtist;
