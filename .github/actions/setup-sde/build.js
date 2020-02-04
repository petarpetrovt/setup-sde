const core = require("@actions/core");
const exec = require('child_process').exec;

try {
    exec('npm install', (error, stdout, stderr) => {
        if (error) {
            console.log(stdout);
            console.log(stderr);
            throw new Error(`NPM INSTALL ERROR: ${error}`);
        }

        exec('node index.js', (error1, stdout1, stderr1) => {
            if (error1) {
                console.log(stdout1);
                console.log(stderr1);
                throw new Error(`NODE INDEX.JS ERROR: ${error1}`);
            }
        });
    });
} catch (error) {
    core.setFailed(error.message);
}