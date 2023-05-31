CREATE TABLE user (
    id                INTEGER       PRIMARY KEY AUTOINCREMENT,
    login             TEXT (32),
    password          TEXT (255),
    email             TEXT (255),
    role_id           INTEGER (25),
    subscription_date INTEGER (255) 
);

CREATE TABLE artist (
    id       INTEGER    PRIMARY KEY AUTOINCREMENT,
    username TEXT (40),
    location TEXT (255),
    genre    TEXT (50) 
);

CREATE TABLE song (
    id               INTEGER       PRIMARY KEY AUTOINCREMENT,
    artist_id        INTEGER       REFERENCES artist (id),
    name             TEXT (70),
    path             TEXT          NOT NULL,
    length           INTEGER (50)  NOT NULL,
    publication_date INTEGER (255),
    genre            TEXT (50),
    thumbnail_path   INTEGER       NOT NULL
);

CREATE TABLE album (
    id               INTEGER       PRIMARY KEY,
    artists_id       INTEGER       REFERENCES artist (id),
    songs_id         INTEGER       REFERENCES song (id),
    name             TEXT (60)     NOT NULL,
    description      TEXT (2500)   NOT NULL,
    length           INTEGER (255) NOT NULL,
    publication_date INTEGER (50),
    genre            TEXT (50),
    thumbnail_path   TEXT          NOT NULL
);

CREATE TABLE playlist (
    id             INTEGER   PRIMARY KEY AUTOINCREMENT,
    user_id        TEXT      NOT NULL
                             REFERENCES user (id),
    songs_id       INTEGER   REFERENCES song (id),
    name           TEXT (50) NOT NULL,
    length         INTEGER   NOT NULL,
    thumbnail_path TEXT      NOT NULL
);