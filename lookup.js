const fs = require('fs');
const path = require('path');
const utils = require('./utils.js');

/**
 * Returns relative url or null
 * @param elementName
 * @param filePath
 * @param globalIgnore
 * @returns {*}
 */
exports.lookForElement = function (elementName, filePath, globalIgnore, rootPath) {
    elementName = elementName + ".html"
    var currentSearchPath = filePath;
    for (let i = 0; i < filePath.split(path.sep).length; i++) {
        const backObject = utils.stepBack(currentSearchPath);
        const result = findFileDeepDown(backObject.path, elementName, globalIgnore, backObject.current);
        if (result || rootPath.length === backObject.path.length) {
            return result ? {
                    relative: path.relative(utils.stepBack(filePath).path, result),
                    absolute: result
                } : null
        }
        currentSearchPath = backObject.path;
    }
}

exports.filterCustomElements = function (tagsArray) {
    return tagsArray.map(function (el) {
        var match = el.match(/<[\w+\-+]+/g);
        if (match) {
            return match[0].substr(1, 999)
        }
    }).filter((el) => {
        return !!el && el.match(/\w+-\w+/) && el !== "dom-module"
    })
}
exports.getProjectRoot = function(filePath, name = "polymer.json") {
    const backObject = utils.stepBack(filePath);
    if (!backObject.path) {
        throw new Error(`No ${name} file found. Can not find project root folder.`)
    }
    const dirContents = fs.readdirSync(backObject.path);
    if (dirContents.indexOf(name) !== -1) {
        return backObject.path;
    } else {
        return exports.getProjectRoot(backObject.path);
    }
}

function findFileDeepDown(dir, fileName, globalIgnore, ignoreChild) {
    const dirContents = fs.readdirSync(dir);
    ignoreChild = ignoreChild || "";
    const dirs = [];
    for (let i = 0; i < dirContents.length; i++) {
        const name = dirContents[i];
        const filePath = dir + path.sep + name;
        const fileStat = fs.lstatSync(filePath);
        if (fileStat.isFile() && name === fileName) {
            return filePath;
        } else if (fileStat.isDirectory() && name !== ignoreChild && globalIgnore.indexOf(name) === -1) {
            dirs.push(filePath);
        }
    }
    for (let i = 0; i < dirs.length; i++) {
        const result = findFileDeepDown(dirs[i], fileName, globalIgnore);
        if (result) {
            return result;
        }
    }
}

