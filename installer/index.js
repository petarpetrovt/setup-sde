const Nightmare = require("nightmare");
const _7z = require('7zip-min');
const fs = require('fs');
const path = require('path');
require("nightmare-download-manager")(Nightmare);

function getOSHyperLinkSelector() {
  switch (process.platform) {
    case "win32": {
      return `a[href$="win.tar.bz2"]`;
    }
    case "darwin": {
      return `a[href$="mac.tar.bz2"]`;
    }
    case "linux": {
      return `a[href$="lin.tar.bz2"]`;
    }
    default: {
      throw new Error(`Platform '${process.platform}' is not supported in this context.`);
    }
  }
}

function unzip(tarBzPath, tarPath, outputDir) {
  const filesPath = path.join(outputDir, `sde-temp-files`);

  return new Promise((resolve, reject) => {
    _7z.unpack(tarBzPath, outputDir, err => {
      if (err) {
        reject(err);
        return;
      }

      _7z.unpack(tarPath, filesPath, err => {
        if (err) {
          reject(err);
          return;
        }

        resolve(filesPath);
      });
    });
  });
}

async function getSDEPath(acceptEUAFromUrl, ) {
  const outputDir = path.resolve(`.output`);
  const tarBzPath = path.join(outputDir, `sde-temp-file.tar.bz2`);
  const tarPath = path.join(outputDir, `sde-temp-file.tar`);
  const filesPath = path.join(outputDir, `sde-temp-files`);
  console.log(`step -2`);

  const nightmare = Nightmare();

  console.log(`step -1`);

  nightmare.on("download", function (state, downloadItem) {
    if (state == "started") {
      nightmare.emit("download", tarBzPath, downloadItem);
    }
  });

  console.log(`step 0`);

  await nightmare
    .downloadManager()
    .then(() => {
      console.log('step 1.');
    })
    .goto(acceptEUAFromUrl)
    .then(() => {
      console.log('step 2.');
    })
    .wait("#intel-licensed-dls-step-1")
    .then(() => {
      console.log('step 3.');
    })
    .check("#intel-licensed-dls-step-1 input[name='accept_license']")
    .then(() => {
      console.log('step 4.');
    })
    .click("#intel-licensed-dls-step-1 input[type='submit']")
    .then(() => {
      console.log('step 5.');
    })
    .wait("#intel-licensed-dls-step-2")
    .then(() => {
      console.log('step 6.');
    })
    .evaluate((selector) => document.querySelector(selector).click(), getOSHyperLinkSelector())
    .then(() => {
      console.log('step 7');
    })
    .waitDownloadsComplete()
    .then(() => {
      console.log('step 8.');
    })
    .end()
    .then(() => {
      console.log('step 9.');
    })
    .catch(error => {
      throw new Error(`Failed to download SDE. Exception: ${error}`);
    });

  console.log(`step 10`);
  const unzipedDirectory = await unzip(tarBzPath, tarPath, outputDir, filesPath);
  const filesPaths = fs.readdirSync(unzipedDirectory);

  if (filesPaths && filesPaths.length === 1) {
    const result = path.join(filesPath, filesPaths[0]);

    return result;
  }

  throw new Error(`Failed to provide SDE path.`);
}

async function run() {
  try {
    // TODO: argument
    const acceptEUAFromUrl = "https://software.intel.com/protected-download/267266/144917";
    const sdePath = await getSDEPath(acceptEUAFromUrl);

    // output
    console.log(sdePath);
  } catch (error) {
    console.error(error);
  }
}

run();
