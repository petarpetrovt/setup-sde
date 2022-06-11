import * as exec from '@actions/exec';
import * as core from '@actions/core';
import * as tool from '@actions/tool-cache';
import * as path from 'path';
import fs from 'fs';

const defaultEnvironmentVariableName: string = "SDE_PATH";
const defaultSdeVersion: string = "9.7.0";

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

function getVersionDownloadUrl(version: string): string {
    const platform: string = getPlatformIdentifier();
    switch (version) {
        case "9.7.0":
            return `https://downloadmirror.intel.com/732268/sde-external-9.7.0-2022-05-09-${platform}.tar.xz`;
        case "9.0.0":
            return `https://downloadmirror.intel.com/684899/sde-external-9.0.0-2021-11-07-${platform}.tar.xz`;
        case "8.69.1":
            return `https://downloadmirror.intel.com/684910/sde-external-8.69.1-2021-07-18-${platform}.tar.bz2`;
        default:
            throw new Error(`SDE version '${version}' is not supported in this context.`);
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

        const url: string = getVersionDownloadUrl(sdeVersion);
        const outputDirectory: string = `.output`;
        const tarFilePath: string = path.join(outputDirectory, `sde-temp-file.tar.bz2`);
        const extractedFilesPath: string = path.join(outputDirectory, `sde-temp-files`);

        // Download tool
        await tool.downloadTool(url, tarFilePath);

        // Ensure file permissions
        // TODO: is this needed when working with @actions/tool-cache
        if (process.platform != "win32") {
            await exec.exec(`sudo chmod`, ['-R', '777', __dirname]);
            await exec.exec(`sudo chmod`, ['-R', '777', outputDirectory]);
        }

        // Extract tool
        if (process.platform != "win32") {
            await tool.extractTar(tarFilePath, extractedFilesPath, ["x"]);
        }
        else {
            // TODO: hangs indefinitely in github action targeting windows-latest
            // await tool.extractTar(tarFilePath, extractedFilesPath);

            // Ensure output directory
            await fs.promises.mkdir(extractedFilesPath, {
                recursive: true
            });

            // TODO: get path from ENV
            const tarExePath = "C:\\Program Files\\Git\\usr\\bin\\tar.exe";
            await exec.exec(`"${tarExePath}"`, [`x`, `--force-local`, `-C`, `${extractedFilesPath}`, `-f`, `${tarFilePath}`]);
        }

        // Ensure export path
        const filesPaths: string[] = await fs.promises.readdir(extractedFilesPath);
        if (filesPaths && filesPaths.length === 1) {
            // Ensure unzip directory permissions
            // TODO: is this needed when working with @actions/tool-cache
            if (process.platform != "win32") {
                await exec.exec(`sudo chmod`, ['-R', '777', outputDirectory]);
            }

            // Export SDE path
            const sdePath = path.resolve(path.join(extractedFilesPath, filesPaths[0]));
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