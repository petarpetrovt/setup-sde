const core = require("@actions/core");
const path = require('path');
const exec = require('child_process').exec;

function npmInstall(directory) {
    return new Promise((resolve, reject) => {
        exec(`npm install ${directory}`, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });
}

function getSDEPath(packagePath) {
    return new Promise((resolve, reject) => {
        exec(`node ${packagePath}`, (error, stdout, stderr) => {
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

        const directory = path.resolve(`package`);
        const packagePath = path.join(directory, `index.js`);

        // TODO: improve info logging
        await npmInstall(directory);

        const sdePath = await getSDEPath(packagePath);

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