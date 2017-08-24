const {spawn} = require('child_process');

exports.install = function (projectRoot, componentsArray) {
    return new Promise(function (res, rej) {
        if(!componentsArray.length){
            res();
            return
        }
        console.log("Installing components with bower...")
        const bowerArguments = ['install', '-SF'].concat(componentsArray)
        console.log(`bower ${bowerArguments.join(" ")}`)


        const ls = spawn(`bower`, bowerArguments, {
            cwd: projectRoot
        });
        ls.stdout.on('data', (data) => {
            console.info(`${data}`);
        });

        ls.stderr.on('data', (data) => {
            console.error(`${data}`);
        });

        ls.on('close', (code) => {
            res()
        });
    })
}