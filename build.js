const execSync = require('child_process').execSync;

console.log(`Dumping env...`);
Object
    .keys(process.env)
    .forEach((key) => console.log(`EV - ${key}:${process.env[key]}`));
console.log(`Done.`);
console.log();

console.log(`Starting NPM install...`);
execSync('npm install', {
    stdio: 'inherit',
    stderr: 'inherit'
});
console.log(`Done.`);
console.log();

console.log(`Starting NODE index.js...`);
execSync('node index.js', {
    stdio: 'inherit',
    stderr: 'inherit'
});
console.log(`Done.`);
console.log();

console.log(`Dumping env...`);
Object
    .keys(process.env)
    .forEach((key) => console.log(`EV - ${key}:${process.env[key]}`));
console.log(`Done.`);
console.log();