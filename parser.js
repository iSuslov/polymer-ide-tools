const fs = require('fs');
const utils = require('./utils.js');

exports.parseTags = function (file) {
    return fs.readFileSync(file, "utf-8").match(/<[^\/][\w+-?]+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[\^'">\s]+))?)+\s*|\s*)\/?>/g);
}


exports.parseStyle = function (content) {
    const matched = content.match(/<style[\s]*include=("[\w-\t\s]+"|'[\w-\t\s]+')/g);
    if (!matched) {
        return
    }
    const result = []
    matched.map(item => item.replace(/<style[\s\w=]+["']|["']/g, "").replace(/\s/g, " ")).forEach(element => {
        element.split(" ").forEach(el => {
            if (el) {
                result.push(el)
            }
        })
    })
    return result;
}

exports.parse = function (settings, content) {
    var matched = content.match(/<!--([\s\S](?!-->))*[\s\S]-->|<[!--\w\-]+[^>]*>|class[\s\n]+\w+[\s\n]+extends[\s\n]+[\w\s.\(\)]+[\s]*(?=\{)/g);
    matched = matched.map(element => {
        return element.replace(/\s+/g, " ");
    });
    const ignoredTags = settings.import.ignoredTags || [];
    const tags = matched.map(_parse).filter(tag=>{
        if(typeof tag === "string" || tag.isComment) {
            return true;
        }
        var ignore = false;
        ignoredTags.forEach(mask =>{
           // console.log(mask, tag, !!tag.name.match(new RegExp(mask)))
            if(!ignore){
                ignore = !!tag.name.match(new RegExp(mask));

            }
        })

        return !ignore;
    });
    const classified = {
        imports: tags.filter(tag => tag.name === "link" && tag.attributes.rel === "import"),
        elements: tags.filter(tag => {
            if (typeof tag !== "object" || tag.isComment) return false;
            return (tag.name.match(/\w-\w/) && tag.name !== "dom-module") ||
                (tag.name === "style" && tag.attributes.include) ||
                (tag.name == "template" && tag.attributes.is)
        }),
        icons: tags.filter(tag => {
            if (typeof tag !== "object" || tag.isComment) return false;
            return !!tag.attributes.icon;
        }),
        effects: tags.filter(tag => {
            if (typeof tag !== "object" || tag.isComment) return false;
            return !!tag.attributes.effects;
        }),
        classDefinitions: tags.filter(tag => typeof tag === "string")[0]
    }

    const result = {
        imports: {},
        allElements: new Set(),
        elements: new Set(),
        icons: new Set(),
        effects: new Set(),
        classDefinitions: new Set(),
        tags: tags
    }

    var lastImport;
    result.tags.forEach(element => {
        if ((element.name === "link" && element.attributes.rel === "import") ||
            (element.isComment && element.value.charAt(0) === "%" && element.value.charAt(element.value.length - 1)) === "%") {
            lastImport = element;
            if (!result.firstImport) {
                result.firstImport = element;
            }
        }
    })
    result.lastImport = lastImport;

    classified.imports.forEach(obj => {
        result.imports[utils.lastInPath(obj.attributes.href).split(".")[0]] = obj
    })

    classified.elements.forEach(tag => {
        if (tag.name === "template") {
            result.elements.add(tag.attributes.is);
            result.allElements.add(tag.attributes.is);
        } else if (tag.name === "style") {
            tag.attributes.include.split(" ").filter(v => !!v).forEach(el => {
                result.elements.add(el)
                result.allElements.add(el)
            })
        } else {
            result.elements.add(tag.name)
            result.allElements.add(tag.name)
        }
    })
    classified.icons.forEach(tag => {
        var icon = tag.attributes.icon;
        if (icon.indexOf(":") === -1 || icon.split(":")[0] === "icons") {
            icon = "iron-icons";
        } else {
            icon = icon.split(":")[0] + "-icons";
        }
        result.allElements.add(icon)
        result.icons.add(icon)
    })
    classified.effects.forEach(tag => {
        tag.attributes.effects.split(" ").filter(v => !!v).forEach(el => {
            result.allElements.add(el)
            result.effects.add(el)
        })
    })
    _parseClassDefinitions(classified.classDefinitions).forEach(el => {
        result.allElements.add(el);
        result.classDefinitions.add(el);
    })

    return result
}

function _parse(tag) {

    //means that we have `class Blablabla ...`
    if (tag.indexOf("<") !== 0) {
        return tag;
    }
    // is comment
    if (tag.indexOf("<!--") === 0) {
        return {
            isComment: true,
            tag: tag,
            value: tag.substring(4, tag.length - 3)
        }
    }

    // main parsing
    const tagArray = tag.match(/[\w-]+|"[^"]*"|'[^']'/g);
    const result = {
        name: tagArray.shift(),
        tag: tag,
        attributes: {}
    }
    // parsing attributes
    for (let i = 0; i < tagArray.length; i++) {
        let val = tagArray[i];
        if (!val) {
            continue
        }
        if (
            (val.indexOf('"') === 0 && val.lastIndexOf('"') === val.length - 1) ||
            (val.indexOf("'") === 0 && val.lastIndexOf("'") === val.length - 1)
        ) {
            val = val.substring(1, val.length - 1)
            result.attributes[tagArray[i - 1]] = val
        } else {
            result.attributes[val] = null;
        }
    }
    return result;
}

function _parseClassDefinitions(line) {
    if(!line) {
        return []
    }
    line = line
        .replace(/\n/g, "")
        .replace(/\s*\.\s*/g, ".")
        .replace(/.*extends/g, "")
        .replace(/[\s*\)]/g, "")
        .split("(");
    return line.map(name => {
        if (name === "Polymer.Element") {
            return "polymer-element"
        }
        return utils.deCamelcase(utils.lastInPath(name, "."))
    });
}