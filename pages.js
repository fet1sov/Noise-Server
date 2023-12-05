const express = require('express');
const app = express();
const fileUpload = require("express-fileupload");

const router = express.Router(),
      bodyParser = require('body-parser');

const session = require('express-session');

const path = require('path');
const { getLocaleByIP, getProfileByUsername, updateArtistInfo, getSongInfoById, getRecomendationInfo, getArtistDataByBelongId, getArtistDataById, authUser, registerUser, getListOfGenres, registerNewArtist } = 
require('./functions');
const cookieParser = require('cookie-parser');

router.use(cookieParser());
router.use(bodyParser.urlencoded({ extended: false}));
router.use(fileUpload({}));

router.use(session({
    secret: 'theVerySecretNoiseKey',
    resave: true,
    saveUninitialized: true,
}));

// index
router.get('/', function (request, response) {
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
    if (!request.session.user)
    {
        response.status(200);
        response.render('signin', {
            title: 'Noise',
            locale: getLocaleByIP(request.socket.remoteAddress)
        });
    } else {
        response.redirect("../");
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
                    response.redirect("../");
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
    if (!request.session.user)
    {
        response.status(200);
        response.render('signup', {
            title: 'Noise',
            locale: getLocaleByIP(request.socket.remoteAddress)
        });
    } else {
        response.redirect("../");
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
    if (!request.session.user)
    {
        response.redirect("../");
    } else {
        request.session.user = null;
        response.redirect("../");
    }
});

// Studio pages
router.get('/studio/:section?', function (request, response) {
    if (request.session.user)
    {
        getArtistDataByBelongId(request.session.user.data.id).then(function(result) {
            if(result)
            {
                getListOfGenres().then(function(genres) {
                    response.status(200);
                    response.render('studio', {
                        title: 'Noise',
                        locale: getLocaleByIP(request.socket.remoteAddress),
                        artistData: result,
                        section: request.params.section,
                        genres: genres
                    });
                });
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
        response.redirect("../");
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
        response.redirect("../");
    }
});

router.get('/song/:song_id', function(request, response) {
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

// 404 HTTP Error
router.get('*', function (request, response) {
    response.status(404);
    response.render('404', {
        title: 'Noise — 404',
        locale: getLocaleByIP(request.socket.remoteAddress)
    });
});

module.exports = router;