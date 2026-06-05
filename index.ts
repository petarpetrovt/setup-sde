import * as exec from '@actions/exec';
import * as core from '@actions/core';
import * as tool from '@actions/tool-cache';
import * as path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const defaultEnvironmentVariableName: string = "SDE_PATH";
const defaultSdeVersion: string = "10.8.0";

function getPlatformIdentifier(): string {
    switch (process.platform) {
        case "win32":
            return `win`;
        case "linux":
            return `lin`;
        default:
            throw new Error(`Platform '${process.platform}' is not supported in this context.`);
    }
}

interface BinaryPair {
    filename: string;
    sha256: string;
}

function getBinaryPair(version: string): BinaryPair {
    const platform: string = getPlatformIdentifier();

    switch (version) {
        case "10.8.0":
            return {
                filename: `sde-external-10.8.0-2026-03-15-${platform}.tar.xz`,
                sha256: platform === "lin"
                    ? "50B320CD226ACEF7A491F5B321FC1BE3C3C7984F9E27A456E64894B5B0979DD3"
                    : "176F87C80EB42BB91B73E1428F4A0FD067DF322F901F9B4359B20B86B92C2BAE",
            };
        case "9.58.0":
            return {
                filename: `sde-external-9.58.0-2025-06-16-${platform}.tar.xz`,
                sha256: platform === "lin"
                    ? "F849ACECAD4C9B108259C643B2688FD65C35723CD23368ABE5DD64B917CC18C0"
                    : "EBB8B3B63FCB0B6C1F9721118BA4883703D2AED9E0DB2DEFED4E44FBA78D9CA9",
            };
        default:
            throw new Error(`SDE version '${version}' is not supported in this context.`);
    }
}

async function computeSha256(filePath: string): Promise<string> {
    const data = await fs.promises.readFile(filePath);
    return crypto.createHash('sha256').update(data).digest('hex').toUpperCase();
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

        const { filename, sha256: expectedSha256 } = getBinaryPair(sdeVersion);
        const url: string = `https://github.com/petarpetrovt/setup-sde/releases/download/binaries/${filename}`;
        const auth: string | undefined = process.env.GITHUB_TOKEN ? `Bearer ${process.env.GITHUB_TOKEN}` : undefined;
        const outputDirectory: string = `.output`;
        const tarFilePath: string = path.join(outputDirectory, `sde-temp-file.tar.bz2`);
        const extractedFilesPath: string = path.join(outputDirectory, `sde-temp-files`);

        // Download tool
        await tool.downloadTool(url, tarFilePath, auth);

        // Verify integrity
        const actualSha256 = await computeSha256(tarFilePath);
        if (actualSha256 !== expectedSha256) {
            core.setFailed(`SHA256 mismatch for ${filename}: expected ${expectedSha256}, got ${actualSha256}`);
            return;
        }

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