const core = require("@actions/core");
const path = require('path');
const exec = require('child_process').exec;

function npmInstall(packagePath) {
    return new Promise((resolve, reject) => {
        exec(`npm install ${packagePath}`, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });
}

function getSDEPath(packageIndexPath) {
    return new Promise((resolve, reject) => {
        exec(`node ${packageIndexPath}`, (error, stdout, stderr) => {
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
        console.log(`cwd: ${process.cwd()}`);

        const environmentVariableName = core.getInput('environmentVariableName') || "SDE_PATH";
        core.debug(`environmentVariableName: ${environmentVariableName}`);

        if (!environmentVariableName || environmentVariableName.length <= 0) {
            throw new Error(`Missing enviroment variable name.`);
        }

        // TODO: pass directory
        const directory = path.join(__dirname, `../../installer`);
        const packageIndexPath = path.join(directory, `index.js`);

        // TODO: improve info logging
        await npmInstall(directory);

        const sdePath = await getSDEPath(packageIndexPath);

        core.exportVariable(environmentVariableName, sdePath);
    }
    catch (error) {
        console.error(error);

        try {
            //core.setFailed(error);
        } catch (er) {
            console.error(er);
        }
    }
}

run();