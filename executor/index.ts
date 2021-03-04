import * as core from '@actions/core';
import * as path from 'path';
const _7z = require('7zip-min');
const fs = require('fs');
import fetch from 'node-fetch';

function unzip(tarBzPath: string, tarPath: string, outputDir: string) {
    const filesPath = path.join(outputDir, `sde-temp-files`);

    return new Promise((resolve, reject) => {
        _7z.unpack(tarBzPath, outputDir, (err: any) => {
            if (err) {
                reject(err);
                return;
            }

            _7z.unpack(tarPath, filesPath, (err: any) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(filesPath);
            });
        });
    });
}

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
        const environmentVariableName = core.getInput("environmentVariableName") || "SDE_PATH";
        core.info(`environmentVariableName: ${environmentVariableName}`);

        if (!environmentVariableName || environmentVariableName.length <= 0) {
            core.setFailed("Missing enviroment variable name.");
            return;
        }

        const platform: string = getPlatformIdentifier();
        const url: string = `https://software.intel.com/content/dam/develop/external/us/en/documents/downloads/sde-external-8.63.0-2021-01-18-${platform}.tar.bz2`;

        const outputDir = path.resolve(`.output`);
        const tarBzPath = path.join(outputDir, `sde-temp-file.tar.bz2`);
        const tarPath = path.join(outputDir, `sde-temp-file.tar`);
        const filesPath = path.join(outputDir, `sde-temp-files`);

        // Download archive
        const file = fs.createWriteStream(tarBzPath);
        await (await fetch(url)).body.pipe(file);

        const unzipedDirectory = await unzip(tarBzPath, tarPath, outputDir);
        const filesPaths = fs.readdirSync(unzipedDirectory);

        if (filesPaths && filesPaths.length === 1) {
            const sdePath = path.join(filesPath, filesPaths[0]);

            core.exportVariable(environmentVariableName, sdePath);
        } else {
            core.setFailed(`Failed to get SDE path.`);
        }
    }
    catch (e) {
        core.setFailed(`An error has occured while setuping SDE binaries: ${e.message}`);
    }
}

run();