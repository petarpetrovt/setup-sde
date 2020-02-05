const execSync = require('child_process').execSync;

console.log(`Starting NPM install...`);
execSync('npm install', {
    stdio: 'inherit'
});
console.log(`Done.`);

console.log(`Starting NODE index.js...`);
execSync('node index.js', {
    stdio: 'inherit'
});
console.log(`Done.`);