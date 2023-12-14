const express = require('express');
const app = express();
const fileUpload = require("express-fileupload");

const router = express.Router(),
      bodyParser = require('body-parser');

const session = require('express-session');

const path = require('path');
const { getLocaleByIP, getAdminInfo, getPlaylistInfoById, proceedSearchByTerm, getSongsForPaginationArtist, incrementPlaysCount, updateSongById, deleteSongList, uploadSoundTrack, getProfileByUsername, updateArtistInfo, getSongInfoById, getRecomendationInfo, getArtistDataByBelongId, getArtistDataById, authUser, registerUser, getListOfGenres, registerNewArtist } = 
require('./functions');
const cookieParser = require('cookie-parser');

var fs = require('fs');

router.use(cookieParser());
router.use(bodyParser.urlencoded({ extended: false}));
router.use(fileUpload({}));

router.use(session({
    secret: 'theVerySecretNoiseKey',
    resave: true,
    saveUninitialized: true,
}));

router.get('/', function (request, response) {
    response.status(200);
    response.render('mainwindow', {
        title: 'Noise',
        historyUrl: request.session.historyUrl ? request.session.historyUrl : null
    });
});

// index
router.get('/index', function (request, response) {
    request.session.historyUrl = request.originalUrl;

    if (!request.session.user)
    {
        response.status(200);
        response.render('index', {
            title: 'Noise',
            locale: getLocaleByIP(request.socket.remoteAddress),
            userData: request.session.user ? request.session.user.data : null
        });
    } else {
        getRecomendationInfo(request.session.user.data.id).then(
            function(recomendations)
            {
                response.status(200);
                response.render('main', {
                    title: 'Noise',
                    locale: getLocaleByIP(request.socket.remoteAddress),
                    userData: request.session.user ? request.session.user.data : null,
                    userRecs: recomendations
                });
            }
        );    
    }
});

// Sign In
router.get('/signin', function (request, response) {
    request.session.historyUrl = request.originalUrl;

    if (!request.session.user)
    {
        response.status(200);
        response.render('signin', {
            title: 'Noise',
            locale: getLocaleByIP(request.socket.remoteAddress)
        });
    } else {
        response.redirect("../index");
    }
});
router.post('/signin', function(request, response) {
    authUser(request.body.username, request.body.password).then(
        function(result) {
            if (result)
            {
                if (result.errorData == 400)
                {
                    response.render('signin', {
                        title: 'Noise',
                        locale: getLocaleByIP(request.socket.remoteAddress),
                        errorData: 400
                    });
                } else {
                    request.session.user = result;
                    response.redirect("../index");
                }
            } else {
                response.render('signin', {
                    title: 'Noise',
                    locale: getLocaleByIP(request.socket.remoteAddress),
                    errorData: 404
                });
            }
        }
    );
});

// Sign Up
router.get('/signup', function (request, response) {
    request.session.historyUrl = request.originalUrl;

    if (!request.session.user)
    {
        response.status(200);
        response.render('signup', {
            title: 'Noise',
            locale: getLocaleByIP(request.socket.remoteAddress)
        });
    } else {
        response.redirect("../index");
    }
});
router.post('/signup', function(request, response) {
    registerUser(request.body.username, request.body.email, request.body.password, request.body.repeatPassword).then(
        function (result) {
            if (result)
            {
                if (result.errorData == 200)
                {
                    response.redirect("../signin");
                } else {
                    response.render('signup', {
                        title: 'Noise',
                        locale: getLocaleByIP(request.socket.remoteAddress),
                        errorData: result.errorData
                    });
                }
            }
        }
    );
});

// Artist
router.get('/artist/:artist_id', function (request, response) {
    request.session.historyUrl = request.originalUrl;

    var artistId = request.params.artist_id;
    var artistData = {};

    getArtistDataById(artistId).then(function(result) {
        if (result)
        {
            response.status(200);
            response.render('artist', {
                title: 'Noise',
                locale: getLocaleByIP(request.socket.remoteAddress),
                userData: request.session.user ? request.session.user.data : null,
                artistData: result,
            });
        } else {
            response.status(404);
            response.render('404', {
                title: 'Noise — 404',
                locale: getLocaleByIP(request.socket.remoteAddress)
            });
        }
    });    
});

// Log out
router.get('/logout', function (request, response) {
    request.session.historyUrl = request.originalUrl;

    if (!request.session.user)
    {
        response.redirect("../index");
    } else {
        request.session.user = null;
        response.redirect("../index");
    }
});

// Studio pages
router.get('/studio/:section?/:subsection?', function (request, response) {
    request.session.historyUrl = request.originalUrl;

    if (request.session.user)
    {
        getArtistDataByBelongId(request.session.user.data.id).then(function(result) {
            if(result)
            {
                request.session.artist = {
                    id: result.id,
                };

                if (request.params.section != "content")
                {
                    getListOfGenres().then(function(genres) {
                        response.status(200);
                        response.render('studio', {
                            title: 'Noise',
                            locale: getLocaleByIP(request.socket.remoteAddress),
                            artistData: result,
                            section: request.params.section,
                            subsection: request.params.subsection,
                            genres: genres
                        });
                    });
                } else {
                    getListOfGenres().then(function(genres) {
                        let songsPerPage = 5;
                        let maxPages = Math.ceil(result.songsList.length / songsPerPage);

                        let currentPage = 0;

                        if (request.query.page && request.query.page < maxPages + 1)
                        {
                            currentPage = request.query.page;
                        } else {
                            currentPage = 0;
                        }

                        getSongsForPaginationArtist(result.id, songsPerPage, currentPage).then(function (songData) {
                            result.songsList = songData;
    
                            response.status(200);
                            response.render('studio', {
                                title: 'Noise',
                                locale: getLocaleByIP(request.socket.remoteAddress),
                                artistData: result,
                                section: request.params.section,
                                subsection: request.params.subsection,
                                genres: genres,

                                page: currentPage,
                                maxPages: maxPages,
                            });
                        });
                    });
                }
            } else {
                getListOfGenres().then(function(genres) {
                    response.status(200);
                    response.render('pages/createcard', {
                        title: 'Noise',
                        locale: getLocaleByIP(request.socket.remoteAddress),
                        genres: genres
                    });
                });  
            }
        });
    } else {
        response.redirect("../index");
    }
});
router.post('/studio/content/add', function (request, response) {
    if (request.session.user && request.session.artist)
    {
        uploadSoundTrack(request.session.artist.id, request.body.songName, request.files.songThumbnail, request.files.songFile, request.body.genre).then(function(songInfo) {
            response.redirect(`/song/${songInfo}`);
        });
    } else {
        response.redirect("../index");
    }
});
router.get('/studio/content/edit/:song_id', function (request, response) {
    request.session.historyUrl = request.originalUrl;

    if (request.session.user)
    {
        getArtistDataByBelongId(request.session.user.data.id).then(function(artistData) {
            if (artistData)
            {
                getListOfGenres().then(function(genres) {
                    getSongInfoById(request.params.song_id).then(function(songInfo) {
                        if (songInfo)
                        {
                            response.status(200);
                            response.render('studio', {
                                title: 'Noise',
                                locale: getLocaleByIP(request.socket.remoteAddress),
                                artistData: artistData,
                                section: "content",
                                subsection: "edittrack",
                                songData: songInfo,
                                genres: genres
                            });
                        } else {
                            response.redirect("/studio");
                        }
                    });
                });
            } else {
                response.redirect("/studio");
            }
        });
    } else {
        response.redirect("/");
    }
});

router.get('/playlist/:playlist_id', function(request, response) {
    request.session.historyUrl = request.originalUrl;

    getPlaylistInfoById(request.params.playlist_id).then(function(playlistInfo) {
        response.status(200);
        response.render('pages/playlistinfo', {
            title: 'Noise',
            locale: getLocaleByIP(request.socket.remoteAddress),
            userData: request.session.user ? request.session.user.data : null,
            playlistInfo: playlistInfo
        });
    });
});

router.get('/search', function (request, response) {
    request.session.historyUrl = request.originalUrl;

    proceedSearchByTerm(request.query.term).then(function(searchResult) {
        response.status(200);
        response.render('search', {
            title: 'Noise',
            locale: getLocaleByIP(request.socket.remoteAddress),
            userData: request.session.user ? request.session.user.data : null,
            searchResult: searchResult
        });
    });
});

router.post('/studio/content/edit/:song_id', function (request, response) {
    if (request.session.user)
    {
        getArtistDataByBelongId(request.session.user.data.id).then(function(artistData) {
            if (artistData)
            {
                getListOfGenres().then(function(genres) {
                    getSongInfoById(request.params.song_id).then(function(songInfo) {
                        if (songInfo) {
                            if (songInfo.artist_id === artistData.id)
                            {
                                updateSongById(request.params.song_id, request.body.songName, request.body.genre, request.files).then(function(songId) {
                                    if (songId)
                                    {
                                        response.redirect(`/song/${songId}`);
                                    }
                                });
                            } else {
                                response.redirect("/studio");
                            }
                        } else {
                            response.redirect("/studio");
                        }
                    });
                });
            } else {
                response.redirect("/studio");
            }
        });
    } else {
        response.redirect("/");
    }
});

router.post('/studio/content/delete', function (request, response) {
    if (request.session.user)
    {
        getArtistDataByBelongId(request.session.user.data.id).then(function(artistData) {
            if (artistData)
            {
                deleteSongList(artistData.id, request.body.songList).then(function(result) {
                    response.redirect("/studio/content");
                });
            } else {
                response.redirect("/studio");
            }
        });
    } else {
        response.redirect("/");
    }
});

router.post('/studio', function (request, response) {
    if (request.session.user)
    {
        if (typeof request.files.bannerImg == "undefined")
        {
            request.files = {
                bannerImg: {}
            };
        }

        getListOfGenres().then(function(genres) {
            registerNewArtist(request.body.username, request.body.description, request.files.bannerImg, request.body.genre, request.session.user.data.id).then(function(artistData) {
                if (artistData.errorData === 200)
                {
                    response.redirect(`../artist/${artistData.data.id}`);
                    return;
                } else {
                    response.status(400);
                }

                response.render('pages/createcard', {
                    title: 'Noise',
                    locale: getLocaleByIP(request.socket.remoteAddress),
                    artistData: artistData.data,
                    errorData: artistData.errorData,
                    genres: genres
                });
            });
        });  
    } else {
        response.redirect("../");
    }
});
router.post('/studio/card', function (request, response) {
    if (request.session.user)
    {   
        if (request.files)
        {
            updateArtistInfo(request.body.username, request.body.description, request.body.genre, request.session.user.data.id, request.files.bannerImg).then(function (artistData) {
                response.redirect(`../artist/${artistData.id}`);
            });
        } else {
            updateArtistInfo(request.body.username, request.body.description, request.body.genre, request.session.user.data.id).then(function (artistData) {
                response.redirect(`../artist/${artistData.id}`);
            });
        }
        
    } else {
        response.redirect("../index");
    }
});

router.get('/song/:song_id', function(request, response) {
    request.session.historyUrl = request.originalUrl;

    getSongInfoById(request.params.song_id).then(function(result) {
        if (result)
        {
            response.status(200);
            response.render('pages/songinfo', {
                title: 'Noise',
                locale: getLocaleByIP(request.socket.remoteAddress),
                userData: request.session.user ? request.session.user.data : null,
                songData: result
            });
        } else {
            response.status(404);
            response.render('404', {
                title: 'Noise — 404',
                locale: getLocaleByIP(request.socket.remoteAddress)
            });
        }
    });
});

router.get('/profile/:username', function(request, response) {
    request.session.historyUrl = request.originalUrl;

    getProfileByUsername(request.params.username).then(function(result) {
        if (result)
        {
            response.status(200);
            response.render('pages/userprofile', {
                title: 'Noise',
                locale: getLocaleByIP(request.socket.remoteAddress),
                userData: request.session.user ? request.session.user.data : null,
                profileData: result
            });
        } else {
            response.status(404);
            response.render('404', {
                title: 'Noise — 404',
                locale: getLocaleByIP(request.socket.remoteAddress)
            });
        }
    });
});

router.get('/admin/:section?', function(request, response) {
    if (request.session.user)
    {   
        if (request.session.user.data.admin) 
        {
            getAdminInfo().then(function (adminData) {
                response.status(200);
                response.render('pages/admin/admin', {
                    title: 'Noise',
                    locale: getLocaleByIP(request.socket.remoteAddress),
                    userData: request.session.user ? request.session.user.data : null,
                    adminData: adminData,
                    section: request.params.section
                });
            });
        } else {
            response.redirect("../index");
        }
    } else {
        response.redirect("../index");
    }
});

/* Additional get information routes */
router.get('/songs/:song_id', function (request, response) {
    incrementPlaysCount(request.params.song_id).then(function(result) {
        response.sendFile(__dirname + `/public/songs/${request.params.song_id}.mp3`);
    });
});

router.get('/banner/:artist_id', function (request, response) {
    const bannerPath = __dirname + `/public/banner/${request.params.artist_id}.png`;

    if (fs.existsSync(bannerPath)) {
        response.sendFile(bannerPath);
    } else {
        response.sendFile(__dirname + `/public/banner/artist_no_thumbnail.png`);
    }
});

router.get('/thumbnails/:song_id', function (request, response) {
    const songPath = __dirname + `/public/thumbnails/${request.params.song_id}.png`;

    if (fs.existsSync(songPath)) {
        response.sendFile(songPath);
    } else {
        response.sendFile(__dirname + `/public/thumbnails/music_no_thumbnail.png`);
    }
});

// 404 HTTP Error
router.get('*', function (request, response) {
    request.session.historyUrl = request.originalUrl;

    response.status(404);
    response.render('404', {
        title: 'Noise — 404',
        locale: getLocaleByIP(request.socket.remoteAddress)
    });
});

module.exports = router;