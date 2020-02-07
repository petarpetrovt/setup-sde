import * as core from '@actions/core';
import { exec } from '@actions/exec';
import { ExecOptions } from '@actions/exec/lib/interfaces';

export class CommandExecutor {
    private readonly _directory: string;
    private readonly _sdePathPrefix: string;
    public sdePath: string | null;

    private constructor(directory: string, sdePathPrefix: string) {
        if (typeof directory !== "string" || directory.length <= 0) {
            throw new Error(`Invalid command executor directory.`);
        }

        if (typeof sdePathPrefix !== "string" || sdePathPrefix.length <= 0) {
            throw new Error(`Invalid SDE path prefix.`);
        }

        this._directory = directory;
        this._sdePathPrefix = sdePathPrefix;
        this.sdePath = null;
    }

    public async execute(value: string, args: string[] | undefined, processOutput: boolean = false): Promise<void> {
        if (typeof value !== "string" || value.length <= 0) {
            throw new Error(`Can't execute empty command.`);
        }

        let options: ExecOptions = {
            cwd: this._directory
        };

        if (processOutput === true) {
            options.listeners = {
                stdout: (data: any) => this.processOutput(data),
                stderr: (data: any) => this.processError(data)
            };
        }

        const isLinux: boolean = process.platform === "linux";

        try {
            if (isLinux) {
                const xvfbArgs: string[] = typeof args !== "undefined" && args.length > 0
                    ? ["--auto-servernum", value].concat(args)
                    : ["--auto-servernum", value];

                await exec("xvfb-run", xvfbArgs);
            } else {
                await exec(value, args, options);
            }
        } finally {
            if (isLinux) {
                await this.cleanUpXvfb();
            }
        }

    }

    private async prepare(): Promise<void> {
        if (process.platform !== "linux") {
            return;
        }

        await exec("sudo apt-get install xvfb");
    }

    private async cleanUpXvfb(): Promise<void> {
        try {
            await exec("bash", ["./cleanup.sh"]);
        } catch {

        }
    }

    private processOutput(value: any): void {
        if (value) {
            const valueString: string = value.toString();
            if (valueString.startsWith(this._sdePathPrefix)) {
                this.sdePath = valueString
                    .substring(this._sdePathPrefix.length)
                    .trim();
            }
            else {
                core.debug(valueString);
            }
        }
    }

    private processError(value: any): void {
        if (value) {
            core.error(value.toString());
        }
    }

    public static async create(directory: string, sdePathPrefix: string): Promise<CommandExecutor> {
        const result = new CommandExecutor(directory, sdePathPrefix);

        await result.prepare();

        return result;
    }
}
