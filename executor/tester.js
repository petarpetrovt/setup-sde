const core = require('@actions/core');
const { promisify } = require('util');
const { resolve } = require('path');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

try {
    const environmentVariableName = process.argv[2];
    if (typeof environmentVariableName !== "string" || environmentVariableName.length <= 0) {
        core.setFailed(`Missing environment variable name.`);
    } else {
        core.info(`Asserting environment variable with name '${environmentVariableName}'.`);
    }

    const environmentVariableValue = process.env[environmentVariableName];
    if (typeof environmentVariableValue !== "string" || environmentVariableValue.length <= 0) {
        core.setFailed(`Missing environment variable with name '${environmentVariableName}'.`);
    } else {
        core.info(`Succesfly asserted environment variable with name '${environmentVariableName}' and value '${environmentVariableValue}'.`);
    }

    try {
        if (!fs.existsSync(environmentVariableValue)) {
            core.setFailed(`Path '${environmentVariableValue}' doesn't exist.`);
        }

        core.info(`Directory files:`);
        getFiles(environmentVariableValue)
            .then(files => files.files(file => core.info(file)))
            .catch(e => core.setFailed(e));
    } catch (err) {
        core.setFailed(err);
    }

}
catch (e) {
    core.warning(e.message);
    core.setFailed(`An error has occured while asserting environment variable with name '${environmentVariableName}'.`);
}

async function getFiles(dir) {
    const subdirs = await readdir(dir);
    const files = await Promise.all(subdirs.map(async (subdir) => {
        const res = resolve(dir, subdir);
        return (await stat(res)).isDirectory() ? getFiles(res) : res;
    }));
    return files.reduce((a, f) => a.concat(f), []);
}