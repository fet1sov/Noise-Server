const fs = require('fs');
const geoip = require('geoip-lite');

exports.getLocaleByIP = (ip) => {
    var region = geoip.lookup(ip);

    var localeContent = "";
    var localeJSON = "";

    if (region)
    {
        localeContent = fs.readFileSync(`${__dirname}/views/locales/${region.country}`, 'utf8');
        localeJSON = JSON.parse(localeContent);
    } else {
        localeContent = fs.readFileSync(`${__dirname}/views/locales/ru-RU.json`, 'utf8');
        localeJSON = JSON.parse(localeContent);
    }

    return localeJSON;
};