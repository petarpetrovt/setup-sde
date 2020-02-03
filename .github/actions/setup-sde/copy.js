var copy = require('copy');

copy('node_modules/electron/dist/**/*.*', 'dist/electron/', function(err, files) {
    if (err) throw err;
    // `files` is an array of the files that were copied
});