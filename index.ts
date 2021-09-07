import * as exec from '@actions/exec';
import * as core from '@actions/core';
import * as tool from '@actions/tool-cache';
import * as path from 'path';
import fs from 'fs';

const defaultEnvironmentVariableName: string = "SDE_PATH";
const defaultSdeVersion: string = "8.69.1-2021-07-18";

function getPlatformIdentifier(): string {
    switch (process.platform) {
        case "win32":
            return `win`;
        case "darwin":
            return `mac`;
        case "linux":
            return `lin`;
        default:
            throw new Error(`Platform '${process.platform}' is not supported in this context.`);
    }
}

async function run(): Promise<void> {
    try {
        const environmentVariableName = core.getInput("environmentVariableName") || defaultEnvironmentVariableName;
        if (!environmentVariableName || environmentVariableName.length <= 0) {
            core.setFailed("Missing environment variable name input variable.");
            return;
        }

        const sdeVersion = core.getInput("sdeVersion") || defaultSdeVersion;
        if (!sdeVersion || sdeVersion.length <= 0) {
            core.setFailed("Missing SDE version input variable.");
            return;
        }

        core.info(`environmentVariableName: ${environmentVariableName}`);
        core.info(`sdeVersion: ${sdeVersion}`);

        const platform: string = getPlatformIdentifier();
        const url: string = `https://software.intel.com/content/dam/develop/external/us/en/documents/downloads/sde-external-${sdeVersion}-${platform}.tar.bz2`;
        const outputDirectory: string = path.resolve(`.output`);
        const tarFilePath: string = path.join(outputDirectory, `sde-temp-file.tar.bz2`);
        const extractedFilesPath: string = path.join(outputDirectory, `sde-temp-files`);

        // Download tool
        await tool.downloadTool(url, tarFilePath);

        // Ensure file permissions
        if (process.platform != "win32") {
            await exec.exec(`sudo chmod`, ['-R', '777', __dirname]);
            await exec.exec(`sudo chmod`, ['-R', '777', outputDirectory]);
        }

        // Extract tool
        await tool.extractTar(tarFilePath, extractedFilesPath);

        // Ensure export path
        const filesPaths: string[] = await fs.promises.readdir(extractedFilesPath);
        if (filesPaths && filesPaths.length === 1) {
            // Ensure unzip directory permissions
            if (process.platform != "win32") {
                await exec.exec(`sudo chmod`, ['-R', '777', outputDirectory]);
            }

            // Export SDE path
            const sdePath = path.join(extractedFilesPath, filesPaths[0]);
            core.exportVariable(environmentVariableName, sdePath);
        } else {
            core.setFailed(`Failed to get SDE path.`);
        }
    }
    catch (e: any) {
        core.setFailed(`An error has occurred while setuping SDE binaries.`);
        core.error(e);
    }
}

run();