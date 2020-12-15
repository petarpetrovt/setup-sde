const fs = require('fs');
const core = require('@actions/core');
const path = require("path");

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

    if (!fs.existsSync(environmentVariableValue)) {
        core.setFailed(`Path '${environmentVariableValue}' doesn't exist.`);
    }

    try {
        const folderPath = path.join(process.cwd(), ...environmentVariableValue.split("/"));
        const filePaths = fs
            .readdirSync(folderPath, { withFileTypes: true })
            .filter((dirent) => dirent.isFile())
            .map((dirent) => dirent.name.split(".")[0]);

        core.info(`Directory files:`);
        filePaths.forEach(filePath => {
            core.info(filePath);
        });
    } catch (err) {
        core.setFailed(err);
    }

}
catch (e) {
    core.warning(e.message);
    core.setFailed(`An error has occured while asserting environment variable with name '${environmentVariableName}'.`);
}