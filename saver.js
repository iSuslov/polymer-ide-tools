/**
 * Created by User on 8/22/17.
 */
const fs = require('fs');
const lookup = require('./lookup.js');
const utils = require('./utils.js');

exports.saveImports = function (settings, filePath, fileContent, parseResult, linksString) {

    console.log(`Saving file with new imports...`);

    var file = "";
    if (parseResult.firstImport) {
        file = replaceNewStrings(fileContent,
            linksString,
            fileContent.indexOf(parseResult.firstImport.tag),
            fileContent.lastIndexOf(parseResult.lastImport.tag) + parseResult.lastImport.tag.length)
    } else {
        file = linksString + "\n" + fileContent;
    }

    fs.writeFileSync(filePath, file);
    console.log(`Success`);
}

function replaceNewStrings(file, imports, start, end) {
    return file.substring(0, start) + imports + file.substring(end);
}

