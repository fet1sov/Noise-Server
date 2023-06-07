const express = require('express'),
    bodyParser = require('body-parser');

const router = express.Router();
const app = express();

let http = require('http');

const serverConfig = require("./config.js");
const customConsole = require("./utils/console.js");

/* API ROUTES */
const API_ROOT = "/api";

const songsRoute = require("./api/songs.js");
app.use(API_ROOT + '/songs', songsRoute);

const userRoute = require("./api/user.js");
app.use(API_ROOT + '/user', userRoute);
/* ------------ */

app.use(express.static(__dirname + '/public'), router);
let httpServer = http.createServer(app).listen(serverConfig.port);

if (httpServer.listening)
{
    customConsole.printColoredMessage(
        `SERVER | Currently listening ${httpServer.address().address.split(":")[3] ? httpServer.address().address.split(":")[3] : "localhost"}:${httpServer.address().port}`, 
        customConsole.BgWhite, 
        customConsole.FgBlack
    );
}