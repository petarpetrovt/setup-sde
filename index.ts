import * as exec from '@actions/exec';
import * as core from '@actions/core';
import * as path from 'path';
import _7z from '7zip-min';
import fs from 'fs';
import fetch from 'node-fetch';

const defaultEnvironmentVariableName: string = "SDE_PATH";
const defaultSdeVersion: string = "8.69.1-2021-07-18";

function unzip(tarBzPath: string, tarPath: string, outputDir: string): Promise<string> {
    const filesPath: string = path.join(outputDir, `sde-temp-files`);

    return new Promise<string>((resolve, reject) => {
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
        const outputDir = path.resolve(`.output`);
        const tarBzPath = path.join(outputDir, `sde-temp-file.tar.bz2`);
        const tarPath = path.join(outputDir, `sde-temp-file.tar`);
        const filesPath = path.join(outputDir, `sde-temp-files`);

        core.info("Ensuring output directory");
        // Ensure output directory
        await fs.promises.mkdir(outputDir, {
            recursive: true
        });

        // Download archive
        core.info("Fetching url");
        const response = await fetch(url);
        if (!response.ok || !response.body) {
            core.setFailed(`Unexpected response: ${response.statusText}`);
            return;
        }

        core.info("Parsing response");
        const buffer: ArrayBuffer = await response.arrayBuffer();

        core.info("Saving response");
        await fs.promises.writeFile(tarBzPath, Buffer.from(buffer));

        core.info("Ensuring file permissions");
        // Ensure file permissions
        if (process.platform != "win32") {
            await exec.exec(`sudo chmod`, ['-R', '777', __dirname]);
            await exec.exec(`sudo chmod`, ['-R', '777', outputDir]);
        }

        // Unzip archive
        core.info("Unzipping");
        let unzipedDirectory: string;
        if (process.platform != "win32") {
            unzipedDirectory = path.join(outputDir, `sde-temp-files`);

            // Ensure output directory
            await fs.promises.mkdir(unzipedDirectory, {
                recursive: true
            });

            // unzip via tar command
            await exec.exec(`tar`, ['xvf', tarBzPath, '-C', unzipedDirectory]);
        } else {
            // unzip via 7zip command
            unzipedDirectory = await unzip(tarBzPath, tarPath, outputDir);
        }

        core.info("Done1");
        const filesPaths: string[] = await fs.promises.readdir(unzipedDirectory);

        core.info("Done2");
        if (filesPaths && filesPaths.length === 1) {
            // Ensure unzip directory permissions
            if (process.platform != "win32") {
                await exec.exec(`sudo chmod`, ['-R', '777', outputDir]);
            }

            // Export SDE path
            const sdePath = path.join(filesPath, filesPaths[0]);
            core.exportVariable(environmentVariableName, sdePath);
        } else {
            core.setFailed(`Failed to get SDE path.`);
        }
    }
    catch (e: any) {
        console.log(e);

        core.setFailed(`An error has occurred while setuping SDE binaries.`);
        core.error(e);
    }
}

run();