const express = require('express'),
    bodyParser = require('body-parser');

const router = express.Router();
const app = express();

let http = require('http');
let https = require('https');

let path = require('path');
let fs = require('fs');

const serverConfig = require("./config.js");
const customConsole = require("./utils/console.js");

/* API ROUTES */
const API_ROOT = "/api";

const artistRoute = require("./api/artist.js");
app.use(API_ROOT + '/artist', artistRoute);

const studioRoute = require("./api/studio.js");
app.use(API_ROOT + '/studio', studioRoute);

const songsRoute = require("./api/songs.js");
app.use(API_ROOT + '/songs', songsRoute);

const userRoute = require("./api/user.js");
app.use(API_ROOT + '/user', userRoute);

const playlistRoute = require("./api/playlist.js");
app.use(API_ROOT + '/playlist', playlistRoute);

app.use(express.static(__dirname + '/public'), router);
app.use(express.static(__dirname + '/views/public'), router);

/* ------------ */
app.set('view engine', 'ejs');

const pageRoute = require("./pages.js");
app.use('/', pageRoute);

if (process.env.NODE_ENV != "test")
{
    let httpServer = http.createServer(app).listen(serverConfig.port);

    customConsole.printColoredMessage(
        `SERVER | Currently listening ${httpServer.address().address.split(":")[3] ? httpServer.address().address.split(":")[3] : "localhost"}:${httpServer.address().port}`, 
        customConsole.BgWhite, 
        customConsole.FgBlack
    );
}

module.exports.app = app;