const core = require("@actions/core");
const path = require('path');
const exec = require('child_process').exec;

function npmInstall(packagePath) {
    return new Promise((resolve, reject) => {
        exec(`npm install`, {
            cwd: packagePath
        }, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });
}

function getSDEPath(packagePath, packageIndexFileName) {
    return new Promise((resolve, reject) => {
        exec(`node ${packageIndexFileName}`, {
            cwd: packagePath
        }, (error, stdout, stderr) => {
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
        const packagePath = path.join(__dirname, `../../installer`);
        const packageIndexFileName = `index.js`;

        // TODO: improve info logging
        await npmInstall(packagePath);

        const sdePath = await getSDEPath(packagePath, packageIndexFileName);

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