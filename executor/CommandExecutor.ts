import { exec } from '@actions/exec';
import { ExecOptions } from '@actions/exec/lib/interfaces';
import path from 'path';

export class CommandExecutor {
    private readonly _directory: string;

    private constructor(directory: string) {
        if (typeof directory !== "string" || directory.length <= 0) {
            throw new Error(`Invalid command executor directory.`);
        }

        this._directory = directory;
    }

    public async execute(value: string, args: string[] | undefined, requiresXvfb: boolean = false): Promise<void> {
        if (typeof value !== "string" || value.length <= 0) {
            throw new Error(`Can't execute empty command.`);
        }

        let options: ExecOptions = {};

        if (!requiresXvfb) {
            options.cwd = this._directory;
        }

        const isLinux: boolean = process.platform === "linux";

        try {
            if (isLinux && requiresXvfb) {
                const xvfbArgs: string[] = typeof args !== "undefined" && args.length > 0
                    ? ["--auto-servernum", value].concat(args)
                    : ["--auto-servernum", value];

                await exec("xvfb-run", xvfbArgs);
            } else {
                await exec(value, args, options);
            }
        } finally {
            if (isLinux && requiresXvfb) {
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
            await exec("bash", [path.join(__dirname, "../cleanup.sh")]);
        } catch {

        }
    }

    public static async create(directory: string): Promise<CommandExecutor> {
        const result = new CommandExecutor(directory);

        await result.prepare();

        return result;
    }
}
