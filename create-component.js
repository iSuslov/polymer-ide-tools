const argv = require('minimist')(process.argv.slice(2)),
    webcomponents = require('./webcomponents.js'),
    fs = require('fs'),
    parser = require('./parser.js'),
    path = require('path'),
    saver = require('./saver.js'),
    lookup = require('./lookup.js'),
    bower = require('./bower.js'),
    utils = require('./utils.js'),
    settings = require("./settings.json");

const filePath = argv.f;
const projectRoot = lookup.getProjectRoot(filePath);
const file = fs.readFileSync(filePath, "utf-8");


if (argv._.indexOf("import") !== -1) {
    organizeImports()
} else if (argv._.indexOf("init") !== -1) {
    if (createElement()) {
        organizeImports()
    }
} else {
    console.log("import or init?")
}

function organizeImports() {
    console.log(`Parsing file ${filePath}...`);
    const parseResult = parser.parse(settings, file);
    console.log(`Mapping imports...`);
    var lookupObject = utils.getImportsString(settings, filePath, parseResult, projectRoot);
    if (lookupObject.notFoundImports.size && settings.webcomponents.active) {
        webcomponents.search(settings, lookupObject.notFoundImports).then((res) => {
            bower.install(projectRoot, res).then(() => {
                if (res.length) {
                    lookupObject = utils.getImportsString(settings, filePath, parseResult, projectRoot);
                }
                saver.saveImports(settings, filePath, file, parseResult, lookupObject.linksString)
            })
        })
    } else {
        saver.saveImports(settings, filePath, file, parseResult, lookupObject.linksString)
    }
}

function createElement() {
    var fileArray = file.split('\n');
    var line = fileArray[argv.l - 1];
    var componentName = line.match(/<[\w+\-]*[^ ]/g)
    if (componentName) {
        componentName = componentName[0].replace(/[<>]/g, "");
    }
    console.error(`Creating file for ${componentName}`)
    var namespace = null;
    const fileNameObj = utils.stepBack(filePath);
    const folderNameObj = utils.stepBack(fileNameObj.path);
    settings.namespaces.forEach(namespaceObject => {
        var mask = namespaceObject.mask.replace("${FOLDER_NAME}", folderNameObj.current).replace("${NAME}", fileNameObj.current.replace(".html", ""));
        if (!namespace && componentName.match(new RegExp(mask))) {
            namespace = namespaceObject;
        }
    });
    if (!namespace) {
        console.error("No namespace found for element")
    }
    var putTo = ""
    if (namespace.putTo.indexOf("./") === 0) {
        putTo = fileNameObj.path + namespace.putTo.substr(1, 99999);
    } else if (namespace.putTo.indexOf("/") === 0) {
        putTo = projectRoot + namespace.putTo.substr(0, 99999);
    } else {
        putTo = fileNameObj.path + namespace.putTo;
    }

    if (namespace.folder) {
        putTo += path.sep + componentName;
        if (!fs.existsSync(putTo)) {
            fs.mkdirSync(putTo);
        }
    }
    putTo += path.sep + componentName + ".html";

    var templatePath = projectRoot +path.sep+ namespace.template

    var templateContent = fs.readFileSync(templatePath, "utf-8")
        .replace(/\$NAME_CAMELCASED/g, componentName.split("-").map(utils.capitalize).join(""))
        .replace(/\$NAME/g, componentName)

    if (!fs.existsSync(putTo)) {
        console.log(`writing to ${putTo}`)
        fs.writeFileSync(putTo, templateContent);
        return true;
    } else {
        console.error(`file already exists at ${putTo}`)
        return false;
    }

}