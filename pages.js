const express = require('express');
const fileUpload = require("express-fileupload");

const router = express.Router(),
      bodyParser = require('body-parser');

const path = require('path');
const { getLocaleByIP, getArtistDataById } = require('./functions');

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

// 404 HTTP Error
router.get('*', function (request, response) {
    response.status(404);
    response.render('404', {
        title: 'Noise — 404',
        locale: getLocaleByIP(request.socket.remoteAddress)
    });
});

module.exports = router;