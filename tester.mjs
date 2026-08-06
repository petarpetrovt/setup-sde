import * as core from '@actions/core';
import * as exec from '@actions/exec';
import path from 'path';
import fs from 'fs';
import { readdir, stat } from 'fs/promises';

async function test() {
    try {
        const environmentVariableName = process.argv[2];
        if (typeof environmentVariableName !== "string" || environmentVariableName.length <= 0) {
            core.setFailed(`Missing environment variable name.`);
        } else {
            core.info(`Asserting environment variable with name '${environmentVariableName}'.`);
        }

        const environmentVariableValue = process.env[environmentVariableName];
        if (typeof environmentVariableValue !== "string" || environmentVariableValue.length <= 0) {
            core.setFailed(`Missing environment variable with name '${environmentVariableName}'.`);
        } else {
            core.info(`Succesfly asserted environment variable with name '${environmentVariableName}' and value '${environmentVariableValue}'.`);
        }

        try {
            if (!fs.existsSync(environmentVariableValue)) {
                core.setFailed(`Path '${environmentVariableValue}' doesn't exist.`);
            }

            core.info(`Directory files:`);

            const files = await getFiles(environmentVariableValue);

            files.forEach(file => core.info(file));
        } catch (err) {
            core.setFailed(err);
        }

        try {
            const sdePathExecutable = path.join(environmentVariableValue, "./sde");
            await exec.exec(`${sdePathExecutable}`, ['-version']);
        } catch (err) {
            core.setFailed(err);
        }
    }
    catch (e) {
        core.setFailed(`An error has occured while asserting environment variable with name '${environmentVariableName}'.`);
        core.error(e);
    }
}

async function getFiles(dir) {
    const subdirs = await readdir(dir);
    const files = await Promise.all(subdirs.map(async (subdir) => {
        const res = path.resolve(dir, subdir);
        return (await stat(res)).isDirectory() ? getFiles(res) : res;
    }));
    return files.reduce((a, f) => a.concat(f), []);
}

test();
