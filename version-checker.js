const https = require("https");
const logger = require("./logger.js");



exports.checkVersion = function () {
    https.get("https://raw.githubusercontent.com/iSuslov/polymer-ide-tools/master/package.json", (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            const newVersionString = JSON.parse(data).version;
            const currentVersionString = exports.getVersion();
            const version = newVersionString.split(".");
            const currentVersion = currentVersionString.split(".");
            for (let i = 0; i < version.length; i++) {
                if (Number(version[i]) > Number(currentVersion[i])) {
                    logger.printUpdateInfo(currentVersionString, newVersionString)
                }
            }
            return


        })
    })
}

exports.getVersion = function() {
    return require("./package.json").version;
}

