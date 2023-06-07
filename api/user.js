const express = require('express');
const fileUpload = require("express-fileupload");

const router = express.Router(),
    bodyParser = require('body-parser');

const path = require('path');
const fs = require('fs');

const customConsole = require("../utils/console.js");

const crypto = require('crypto');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.post('/authorize', function (request, response) {
    logMessage(`API [USER]`, `Got the request body: { ${request.body.session_token} }`, 0);

    if (!request.body.session_token) 
    {
        let login = request.body.login.trim();
        let passMD5 = crypto.createHash('md5').update(request.body.password).digest('hex');

        let query = `SELECT * FROM user WHERE login='${login}'`;
        db.get(query, function (err, row) {
            if (typeof row != "undefined") {
                logMessage(`SQL`, `Query: ${query}`, 0);

                if (row.password == passMD5) {
                    let data = {
                        id: row.id,
                        session_token: row.session_token,
                        login: row.login,
                        email: row.email,
                        role_id: row.role_id,
                        subscription_date: row.subscription_date,
                    };

                    customConsole.logMessage(`API [USER]`, `Returned 200 HTTP code with user data`, 1);

                    response.statusCode = 200;
                    response.send(JSON.stringify(data));
                    return;
                } else {
                    customConsole.logMessage(`API [USER]`, `Returned 401 HTTP code. (Wrong password)`, 3);

                    response.statusCode = 401;
                    response.send({ status: "Wrond password" });
                    return;
                }
            } else {
                customConsole.logMessage(`API [USER]`, `Returned 404 HTTP code. (Account not found)`, 3);

                response.statusCode = 404;
                response.send({ status: "Account not found" });
                return;
            }
        });
    } else {
        let query = `SELECT * FROM user WHERE session_token='${request.body.session_token}'`;
        db.get(query, function (err, row) {
            customConsole.logMessage(`SQL`, `Query: ${query}`, 0);

            if (typeof row != "undefined") {
                let data = {
                    id: row.id,
                    session_token: row.session_token,
                    login: row.login,
                    email: row.email,
                    role_id: row.role_id,
                    subscription_date: row.subscription_date,
                };

                customConsole.logMessage(`API [USER]`, `Returned 200 HTTP code with user data`, 1);

                response.statusCode = 200;
                response.send(JSON.stringify(data));
                return;
            } else {
                customConsole.logMessage(`API [USER]`, `Returned 404 HTTP code. (Account not found)`, 3);

                response.statusCode = 404;
                response.send({ status: "Account not found" });
                return;
            }
        });
    }
});

router.post('/register', function (request, response) {
    let login = request.body.login.trim();
    let email = request.body.email.trim();
    let passMD5 = crypto.createHash('md5').update(request.body.password).digest('hex');

    if (login.length > 30) {
        customConsole.logMessage(`API [USER]`, `Returned 501 HTTP code. (Login should less than 30 symbols)`, 3);

        response.statusCode = 501;
        response.send(JSON.stringify({ status: "Login should less than 30 symbols" }));
        return;
    }

    if (login.length < 3) {
        customConsole.logMessage(`API [USER]`, `Returned 502 HTTP code. (Login should be more 3 symbols)`, 3);

        response.statusCode = 502;
        response.send(JSON.stringify({ status: "Login should be more 3 symbols" }));
        return;
    }

    if (!(/^[A-Za-z0-9]*$/.test(login))) {
        customConsole.logMessage(`API [USER]`, `Returned 503 HTTP code. (Only latin symbols in login)`, 3);

        response.statusCode = 503;
        response.send(JSON.stringify({ status: "Only latin symbols in login" }));
        return;
    }

    let query = `SELECT * FROM user WHERE UPPER(login) LIKE UPPER('${login}')`;
    db.get(query, function (err, row) {
        if (typeof row != "undefined") {
            customConsole.logMessage(`API [USER]`, `Returned 503 HTTP code. (Login is already occupied)`, 3);

            response.statusCode = 504;
            response.send(JSON.stringify({ status: "Login is already occupied" }));
            return;
        } else {
            let accessToken = '';

            let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let charactersLength = characters.length;
            for (let i = 0; i < 33; i++) {
                accessToken += characters.charAt(Math.floor(Math.random() * charactersLength));
            }

            let passMD5 = crypto.createHash('md5').update(request.body.password).digest('hex');

            let query = `INSERT INTO user VALUES(NULL, '${accessToken}', '${login}', '${passMD5}', '${request.body.email.trim()}', '0', '0')`;
            customConsole.logMessage(`SQL`, query, 1);
            db.run(query);

            customConsole.logMessage(`SQL`, `Account has been created`, 1);

            response.statusCode = 200;
            response.send(JSON.stringify({ status: "Account created" }));
            return;
        }
    });
});

module.exports = router;