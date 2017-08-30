const path = require('path');
const lookup = require('./lookup.js');

exports.capitalize = function (value) {
    return value.charAt(0).toUpperCase() + value.slice(1)
}
exports.deCamelcase = function (value) {
    value = value.charAt(0).toLowerCase() + value.slice(1);
    return value.replace(/([A-Z])/g, "-$1").toLowerCase()
}
exports.lastInPath = function (path, sep = "/") {
    const arr = path.split(sep);
    return arr[arr.length - 1]
}
exports.stepBack = function (_path) {
    let arr = _path.split(path.sep);
    const current = arr.pop();
    return {
        path: arr.join(path.sep),
        current: current
    }
}

exports.getImportsString = function (settings, filePath, parseResult, projectRoot) {
    const lookupObject = lookUpAllImports(settings, filePath, parseResult, projectRoot);

    var linksString = concatImports(parseResult, lookupObject.imports, lookupObject.unusedImports)

    if (lookupObject.imports.size) {
        linksString = linksString.substr(0, linksString.length - 1)
    }

    lookupObject.linksString = linksString
    return lookupObject
}

function concatImports(parseResult, imports, unusedImports) {
    var importsBlock = "";

    if (parseResult.classDefinitions.size) {
        importsBlock += "<!--% Class Imports %-->\n";
        importsBlock += concatImportsBlock(parseResult.classDefinitions, imports);
    }
    const sortedElements = sortElements(parseResult.elements, imports);
    for (let header in sortedElements) {
        let arr = sortedElements[header];
        arr = arr.sort((obj1, obj2) => {
            return obj1.href < obj2 ? -1 : 1;
        });
        importsBlock += `<!--% ${header} Imports %-->\n`;
        arr.forEach(obj => {
            importsBlock += obj.tag + "\n";
        })
    }

    if (parseResult.icons.size) {
        importsBlock += "<!--% Icons %-->\n";
        importsBlock += concatImportsBlock(parseResult.icons, imports);
    }
    if (parseResult.effects.size) {
        importsBlock += "<!--% Effects %-->\n";
        importsBlock += concatImportsBlock(parseResult.effects, imports);
    }
    if (unusedImports.length) {
        importsBlock += "<!--% Other imports %-->\n";
        importsBlock += unusedImports.join("\n") + "\n"
    }
    return importsBlock
}


function concatImportsBlock(blockSet, imports) {
    var result = "";

    blockSet.forEach(el => {
        const obj = imports.get(el);
        if (obj) {
            result += obj.tag + "\n";
        }
    })
    return result;
}

function lookUpAllImports(settings, filePath, parseResult, projectRoot) {
    const imports = new Map();
    const unusedImports = [];
    const notFoundImports = new Set();
    const resolve = getResolvedNames(settings);
    parseResult.allElements.forEach(el => {
        const elResolved = resolve[el] || el;
        let importObj = parseResult.imports[elResolved];
        if (importObj) {
            imports.set(el, {tag: importObj.tag, href: importObj.attributes.href});
            delete parseResult.imports[elResolved];
        } else {
            const lookupResult = lookup.lookForElement(elResolved, filePath, settings.import.ignoreFolderNames || [], projectRoot)
            if (!lookupResult) {
                console.warn("No file found for element ", el)
                notFoundImports.add(el)
            } else {
                imports.set(el, {
                    tag: `<link rel="import" href="${lookupResult.relative}">`,
                    href: lookupResult.relative
                })
            }
        }
    })
    for (let name in parseResult.imports) {
        unusedImports.push(parseResult.imports[name].tag)
    }
    return {
        imports: imports,
        unusedImports: unusedImports,
        notFoundImports: notFoundImports
    }
}

function sortElements(elementsMap, imports) {
    var map = {}
    elementsMap.forEach((value) => {
        const importObject = imports.get(value);
        if (importObject) {
            const header = getHeader(importObject.href)
            if (!map[header]) {
                map[header] = [];
            }
            map[header].push(importObject)
        }
    });
    return map;
}

function getHeader(href) {
    var parseRes = href.replace(/.*bower_components\//g, "");
    if (parseRes === href) {
        return "Application"
    } else {
        var name = parseRes.split("/")[0];
        return exports.capitalize(name.split("-")[0]);
    }
}

function getResolvedNames(settings) {
    const resolve = settings.import.resolve;
    const map = {};
    for(let name in resolve){
        resolve[name].forEach((el)=>{
            map[el] = name;
        })
    }
    return map;
}