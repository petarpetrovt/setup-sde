import * as exec from '@actions/exec';
import * as core from '@actions/core';
import * as path from 'path';
import _7z from '7zip-min';
import fs from 'fs';
import fetch from 'node-fetch';
import util from 'util';

const defaultEnvironmentVariableName: string = "SDE_PATH";
const defaultSdeVersion: string = "8.69.1-2021-07-18";
const streamPipeline = util.promisify(require('stream').pipeline);

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

        // Ensure output directory
        fs.mkdir(outputDir, {
            recursive: true
        }, (err: any) => {
            if (err) throw err;
        });

        // Download archive
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`unexpected response ${response.statusText}`);
        }
        await streamPipeline(response.body, fs.createWriteStream(tarBzPath))

        if (process.platform != "win32") {
            await exec.exec(`sudo chmod`, ['-R', '777', __dirname]);
            await exec.exec(`sudo chmod`, ['-R', '777', outputDir]);
        }

        // Unzip archive
        let unzipedDirectory: string;
        if (process.platform != "win32") {
            unzipedDirectory = path.join(outputDir, `sde-temp-files`);

            // Ensure output directory
            fs.mkdir(unzipedDirectory, {
                recursive: true
            }, (err: any) => {
                if (err) throw err;
            });

            await exec.exec(`tar`, ['xvf', tarBzPath, '-C', unzipedDirectory]);
        } else {
            unzipedDirectory = await unzip(tarBzPath, tarPath, outputDir);
        }
        const filesPaths: string[] = fs.readdirSync(unzipedDirectory);

        if (filesPaths && filesPaths.length === 1) {
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
        core.setFailed(`An error has occurred while setuping SDE binaries.`);
        core.error(e);
    }
}

run();