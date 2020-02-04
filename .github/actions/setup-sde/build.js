const exec = require('child_process').exec;

exec('npm install', (error, stdout, stderr) => {
    if (error) {
        console.log(stdout);
        console.log(stderr);
        console.error(`NPM INSTALL ERROR: ${error}`);
        return;
    }

    exec('node index.js', (error1, stdout1, stderr1) => {
        if (error1) {
            console.log(stdout1);
            console.log(stderr1);
            console.error(`NODE INDEX.JS ERROR: ${error1}`);
            return;
        }
    });
});