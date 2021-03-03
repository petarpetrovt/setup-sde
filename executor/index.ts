import * as core from '@actions/core';
import * as path from 'path';
import { CommandExecutor } from './CommandExecutor';

const installerFileName = 'index.js';
const installerDirectoryPath = path.join(__dirname, '../../installer');
const installerPath = path.join(installerDirectoryPath, installerFileName);

async function run(): Promise<void> {
    try {
        const executor: CommandExecutor = await CommandExecutor.create(installerDirectoryPath);

        core.info(`Running installer: ${installerDirectoryPath}`);
        core.info(``);

        await executor.execute('npm', ['install'], false);
        await executor.execute('node', [installerPath], true);

        core.info(`Finished installing.`);
        core.info(``);

        if (process.platform != "win32") {
            // chmod -R +x
            core.info(`Running chmod for ${process.platform} platform.`);
            core.info(``);

            const environmentVariableName = process.argv[2];
            if (typeof environmentVariableName !== "string" || environmentVariableName.length <= 0) {
                core.setFailed(`Missing environment variable name.`);
                return;
            } else {
                core.info(`Asserting environment variable with name '${environmentVariableName}'.`);
            }

            const environmentVariableValue = process.env[environmentVariableName];
            if (typeof environmentVariableValue !== "string" || environmentVariableValue.length <= 0) {
                core.setFailed(`Missing environment variable with name '${environmentVariableName}'.`);
                return;
            } else {
                core.info(`Succesfly asserted environment variable with name '${environmentVariableName}' and value '${environmentVariableValue}'.`);
            }

            const executor2: CommandExecutor = await CommandExecutor.create(installerDirectoryPath);
            executor2.execute(`chmod`, ['-R', '+x', environmentVariableValue], false);
        }
    }
    catch (e) {
        core.setFailed(`An error has occured while setuping SDE binaries: ${e.message}`);
    }
}

run();