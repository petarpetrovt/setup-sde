import * as core from '@actions/core';
import * as path from 'path';
import { CommandExecutor } from './CommandExecutor';

const installerFileName = 'index.js';
const installerDirectoryPath = path.join(__dirname, '../../installer');
const installerPath = path.join(installerDirectoryPath, installerFileName);

async function run(): Promise<void> {
    try {
        core.debug(`Installer path: ${installerDirectoryPath}`);

        const executor: CommandExecutor = await CommandExecutor.create(installerDirectoryPath);
        await executor.execute('npm', ['install'], false);
        await executor.execute('node', [installerPath], true);

        if (process.platform != "win32") {
            // chmod -R +x
            const executor2: CommandExecutor = await CommandExecutor.create(installerDirectoryPath);
            executor2.execute(`chmod`, ['-R', '+x'], false);
        }
    }
    catch (e) {
        core.setFailed(`An error has occured while setuping SDE binaries: ${e.message}`);
    }
}

run();