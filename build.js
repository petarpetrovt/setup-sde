const exec = require('child_process').exec;
const execSync = require('child_process').execSync;

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
        // TODO: improve info logging
        execSync('npm install', {
            stdout: 'inherit',
            stdout: 'inherit'
        });

        const core = require("@actions/core");

        console.log(`Starting action..`);

        try {
            const environmentVariableName = core.getInput('environmentVariableName') || "SDE_PATH";
            core.debug(`environmentVariableName: ${environmentVariableName}`);

            if (!environmentVariableName || environmentVariableName.length <= 0) {
                throw new Error(`Missing enviroment variable name.`);
            }

            const sdePath = await getSDEPath();

            core.exportVariable(environmentVariableName, sdePath);

            console.log(`Retrieved SDE path: ${sdePath}`);
        } catch (error) {
            core.setFailed(error);
        }
    }
    catch (ex) {
        console.error(ex);
    }
}

run();