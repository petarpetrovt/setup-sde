const core = require('@actions/core');

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
}
catch (e) {
    core.warning(e.message);
    core.setFailed(`An error has occured while asserting environment variable with name '${environmentVariableName}'.`);
}