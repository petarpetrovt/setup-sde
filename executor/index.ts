import * as core from '@actions/core';
import * as path from 'path';
import { CommandExecutor } from './CommandExecutor';

const installerDirectoryPath = path.join(__dirname, '../../installer');
const installerFileName = 'index.js';

async function run(): Promise<void> {
    try {
        core.debug(`Installer path: ${installerDirectoryPath}`);

        const executor: CommandExecutor = await CommandExecutor.create(installerDirectoryPath);

        await executor.execute('npm', ['install']);

        const absolutePath: string = path.join(installerDirectoryPath, installerFileName);

        await executor.execute('node', [absolutePath], true);
    }
    catch (e) {
        core.setFailed(`An error has occured while setuping SDE binaries: ${e.message}`);
    }
}

run();