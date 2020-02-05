const core = require("@actions/core");
const path = require("path");
const exec = require("child_process").exec;

function npmInstall(packagePath) {
    return new Promise((resolve, reject) => {
        exec("npm install", {
            cwd: packagePath
        }, (error, stdout, stderr) => {
            core.debug(stdout);
            core.debug(stderr);

            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });
}

function installSDE(packagePath, packageIndexFileName) {
    return new Promise((resolve, reject) => {
        exec(`node ${packageIndexFileName}`, {
            cwd: packagePath
        }, (error, stdout, stderr) => {
            core.debug(stdout);
            core.debug(stderr);

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
        const environmentVariableName = core.getInput("environmentVariableName") || "SDE_PATH";
        core.debug(`environmentVariableName: ${environmentVariableName}`);

        if (!environmentVariableName || environmentVariableName.length <= 0) {
            throw new Error("Missing enviroment variable name.");
        }

        const packagePath = path.join(__dirname, "../../installer");
        const packageIndexFileName = "index.js";

        await npmInstall(packagePath);

        const sdePath = await installSDE(packagePath, packageIndexFileName);

        core.exportVariable(environmentVariableName, sdePath);
    }
    catch (e) {
        core.error(e);
        core.setFailed("An error has occured while setuping SDE binaries.");
    }
}

run();