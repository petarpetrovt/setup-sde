const core = require("@actions/core");
const exec = require('@actions/exec');
const path = require("path");

async function run() {
    try {
        const environmentVariableName = core.getInput("environmentVariableName") || "SDE_PATH";
        core.debug(`environmentVariableName: ${environmentVariableName}`);

        if (!environmentVariableName || environmentVariableName.length <= 0) {
            core.setFailed("Missing enviroment variable name.");
            return;
        }

        // TODO: "../installer" when running node index.js not dist
        const packagePath = path.join(__dirname, "../../installer");
        const packageIndexFileName = "index.js";

        await exec.exec("npm", [`install`], {
            cwd: packagePath
        });

        var sdePath = null;

        await exec.exec(`node`, [packageIndexFileName], {
            cwd: packagePath,
            listeners: {
                stdout: (data) => {
                    const prefix = `SDE_PATH:`;
                    if (data && data.toString().startsWith(prefix)) {
                        sdePath = data.toString().substring(prefix.length);
                    } else {
                        core.debug(sdePath);
                    }
                }
            }
        });

        if (!sdePath || sdePath.length <= 0) {
            throw new Error("Could not provide SDE binaries path.");
        }

        core.exportVariable(environmentVariableName, sdePath.trim());
    }
    catch (e) {
        core.setFailed(`An error has occured while setuping SDE binaries: ${e.message}`);
    }
}

run();