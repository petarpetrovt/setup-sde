const exec = require('child_process').exec;

exec('npm install', (error, stdout, stderr) => {
    if (error) {
        console.log(`NPM INSTALL ERROR: ${error}`);
        return;
    }

    exec('node index.js', (error1, stdout1, stderr1) => {
        console.log(stdout1);
        console.log(stderr1);
        
        if (error1) {
            console.log(`NODE INDEX.JS ERROR: ${error1}`);
            return;
        }
    });
});