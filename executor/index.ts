import * as core from '@actions/core';
import * as path from 'path';
import { CommandExecutor } from './CommandExecutor';

// TODO: "../installer" when running node index.js not dist
const installerDirectoryPath = path.join(__dirname, "../../installer");
const installerFileName = "index.js";
const installerSdePathPrefix = `SDE_PATH:`;

async function run(): Promise<void> {
    try {
        const environmentVariableName = core.getInput("environmentVariableName") || "SDE_PATH";
        core.debug(`environmentVariableName: ${environmentVariableName}`);

        if (!environmentVariableName || environmentVariableName.length <= 0) {
            core.setFailed("Missing enviroment variable name.");
            return;
        }

        const executor: CommandExecutor = await CommandExecutor.create(installerDirectoryPath, installerSdePathPrefix);

        await executor.execute("npm", ["install"]);
        await executor.execute("node", [installerFileName], true);

        if (!executor.sdePath || executor.sdePath.length <= 0) {
            throw new Error("Could not provide SDE binaries path.");
        }

        core.exportVariable(environmentVariableName, executor.sdePath);
    }
    catch (e) {
        core.setFailed(`An error has occured while setuping SDE binaries: ${e.message}`);
    }
}

run();