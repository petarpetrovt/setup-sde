const { spawnSync } = require('child_process');

spawnSync('npm install');
spawnSync('node index.js');