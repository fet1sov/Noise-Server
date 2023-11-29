const express = require('express');
const app = express();
const fileUpload = require("express-fileupload");

const router = express.Router(),
      bodyParser = require('body-parser');

const path = require('path');
const { getLocaleByIP, getArtistDataById, authUser } = require('./functions');

router.use(bodyParser.urlencoded({ extended: false}));

// index
router.get('/', function (request, response) {
    response.status(200);
    response.render('index', {
        title: 'Noise',
        locale: getLocaleByIP(request.socket.remoteAddress)
    });
});

// Sign In
router.get('/signin', function (request, response) {
    response.status(200);
    response.render('signin', {
        title: 'Noise',
        locale: getLocaleByIP(request.socket.remoteAddress)
    });
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
                    app.use(session({
                        secret: result.data.session_token,
                        resave: false,
                        saveUninitialized: true,
                        cookie: { }
                    }));

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
    response.status(200);
    response.render('signup', {
        title: 'Noise',
        locale: getLocaleByIP(request.socket.remoteAddress)
    });
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
                artistData: result
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

// Studio pages
router.get('/studio/:section?', function (request, response) {
    response.status(200);

    response.render('studio', {
        title: 'Noise',
        locale: getLocaleByIP(request.socket.remoteAddress),
        section: request.params.section,
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