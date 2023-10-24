const express = require('express'),
    bodyParser = require('body-parser');

const router = express.Router();
const app = express();

let http = require('http');

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

const pageRoute = require("./pages.js");
app.use('/', pageRoute);
/* ------------ */

app.use(express.static(__dirname + '/public'), router);
app.set('view engine', 'ejs');
let httpServer = http.createServer(app).listen(serverConfig.port);


let publicdir = __dirname + '/web';

app.use(function (req, res, next) {
    if (req.path.indexOf('.') === -1) {
        let file = publicdir + req.path + '.html';
        fs.exists(file, function (exists) {
            if (exists)
                req.url += '.html';
            next();
        });
    }
    else
        next();
});
app.use(express.static(publicdir), router);

app.get('*', function (request, response) {
    response.statusCode = 404;
    response.sendFile("404.html", { root: path.join(__dirname, '/web') });
});

if (httpServer.listening)
{
    customConsole.printColoredMessage(
        `SERVER | Currently listening ${httpServer.address().address.split(":")[3] ? httpServer.address().address.split(":")[3] : "localhost"}:${httpServer.address().port}`, 
        customConsole.BgWhite, 
        customConsole.FgBlack
    );
}