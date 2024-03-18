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

if (serverConfig.web)
{
    const pageRoute = require("./pages.js");
    app.use('/', pageRoute);
}

/* ------------ */
app.set('view engine', 'ejs');

let httpServer = null;
let httpsServer = null;

if (serverConfig.https)
{
    //pfx: fs.readFileSync(path.join(__dirname,'./cert/test_cert.pfx')),

    let options = {
        key: fs.readFileSync(path.join(__dirname,'./cert/cert.key')),
        cert: fs.readFileSync(path.join(__dirname,'./cert/cert.crt')),
        passphrase: 'login9226',
    };

    console.log(
        `${customConsole.BgGreen + customConsole.FgWhite} SSL ${customConsole.BgBlack + customConsole.FgGreen} SSL Certificate connected`);

    httpServer = http.createServer(app).listen(8081);
    httpsServer = https.createServer(options, app).listen(serverConfig.port);
    //socketConnection(httpsServer);
} else {
    httpServer = http.createServer(app).listen(serverConfig.port);
    //socketConnection(httpServer);
}

if (httpServer.listening)
{
    customConsole.printColoredMessage(
        `SERVER | Currently listening ${httpServer.address().address.split(":")[3] ? httpServer.address().address.split(":")[3] : "localhost"}:${httpServer.address().port}`, 
        customConsole.BgWhite, 
        customConsole.FgBlack
    );
}