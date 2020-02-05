const exec = require('child_process').exec;

function npmInstall() {
    return new Promise((resolve, reject) => {
        exec('npm install', (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });
}

function getSDEPath() {
    return new Promise((resolve, reject) => {
        exec('node index.js', (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(stdout);
        });
    });
}

async function run() {
    try {
        await npmInstall();

        const core = require("@actions/core");

        try {
            const sdePath = await getSDEPath();

            core.exportVariable("SDE_PATH", sdePath);
        } catch (error) {
            core.setFailed(error);
        }
    }
    catch (ex) {
        console.error(ex);
    }
}

run();