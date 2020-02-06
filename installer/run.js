const { run } = require("./index");

function xvfb(options) {
    const Xvfb = require('xvfb');

    var xvfb = new Xvfb(options)

    function close() {
        return new Promise((resolve, reject) => {
            xvfb.stop(err => (err ? reject(err) : resolve()))
        })
    }

    return new Promise((resolve, reject) => {
        xvfb.start(err => (err ? reject(err) : resolve(close)))
    })
}

async function main() {
    if (process.platform === "linux") {
        const close = await xvfb();

        try {
            run();
        }
        finally {
            await close();
        }
    } else {
        run();
    }
}

main();