const log = console.log;
const clc = require('cli-color');
const versionChecker = require('./version-checker.js');


exports.printUpdateInfo = (version, newVersion) => {
    var spaces = 13 - (version + newVersion).length + 4;
    log(clc.yellow("\n\n ╭────────────────────────────────────────────────╮"))
    log(clc.yellow(" │                                                │"))
    log(clc.yellow(" │        ") + `Update available ${version} → ` + clc.green(newVersion) + new Array(spaces).join(" ") + clc.yellow("    │"))
    log(clc.yellow(" │    ") + `Run ${clc.cyan("npm i -g polymer-ide-tools")} to update` + clc.yellow("    │"))
    log(clc.yellow(" │                                                │"))
    log(clc.yellow(" ╰────────────────────────────────────────────────╯\n\n"))
}
exports.printIntro = () => {
    log("\n")
    log(clc.blueBright("    _/_/_/") + clc.magentaBright("  _/_/_/") + clc.blueBright("    _/_/_/_/"))
    log(clc.blueBright("     _/  ") + clc.magentaBright("  _/    _/ ") + clc.blueBright(" _/             ") + clc.bold.underline("Polymer IDE tools"))
    log(clc.blueBright("    _/   ") + clc.magentaBright(" _/    _/") + clc.blueBright("  _/_/_/") + "          Productivity booster for your polymer projects")
    log(clc.blueBright("   _/  ") + clc.magentaBright("  _/    _/ ") + clc.blueBright(" _/"))
    log(clc.blueBright("_/_/_/ ") + clc.magentaBright(" _/_/_/  ") + clc.blueBright("  _/_/_/_/") + "          Usage `polymer-ide-tools <command> [options...]`\n")
    log(clc.bold.italic("by Ivan Suslov. https://polymer-ide-tools.com"))
}
exports.version = () => {
    log(versionChecker.getVersion())
}
exports.help = (command) => {
    switch (command){
        case "import":
        case "component":
        case "init":
        default:
            log(clc.bold.underline("\n\nAvailable Commands\n"))
            log("init           Creates `ide_tools` folder in the root of your project with default settings and templates")
            log("import         Checks your file for used components and looks for it in your project folders and on webcomponents.org")
            log("component      Creates component based on naming rules defined in settings.json")
            log(clc.bold.underline("\n\nGlobal options\n"))
            log(`${clc.bold("--root ")}${clc.underline("string")}\t\t\t\t\t\tThe root directory of your project. Defaults to the first\n\t\t\t\t\t\t\t\t\tfolder containing 'polymer.json' up through hierarchy.`)
            log(`${clc.bold("--root-marker ")}${clc.underline("string")}\t\t\t\tFile name to automatically determine the root directory.\n\t\t\t\t\t\t\t\t\tDefaults to the 'polymer.json'.`)
            log(`${clc.bold("--tools ")}${clc.underline("string")}\t\t\t\t\t\tThe directory containing templates and settings. Defaults\n\t\t\t\t\t\t\t\t\tto the 'ide_tools' in the root of your project.`)
            log(`${clc.bold("-v, --verbose")}\t\t\t\t\t\tturn on debugging output`)
            log(`${clc.bold("-h, --help")}\t\t\t\t\t\t\tprint out helpful usage information`)
            log(`${clc.bold("\n--version")}\t\t\t\t\t\t\tprint current version`)
    }
}
