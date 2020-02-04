const core = require("@actions/core");
const Nightmare = require("nightmare");
const tc = require("@actions/tool-cache");
const _7z = require('7zip-min');
const fs = require('fs');
const path = require('path');
require("nightmare-download-manager")(Nightmare);

const acceptEUAFromUrl = "https://software.intel.com/protected-download/267266/144917";
const sdeTarName = "sde-external-8.35.0-2019-03-11-win.tar.bz2";
const outputDir = path.resolve(`.output`);
const downloadPath = path.join(outputDir, `sde-temp-file.tar.bz2`);
const tarPath = path.join(outputDir, `sde-temp-file.tar`);

try {
  const envName = core.getInput("myInput");
  console.log(`EnvName: ${envName}`);

  const nightmare = Nightmare({
    show: false
  });

  nightmare.on("download", function (state, downloadItem) {
    if (state == "started") {
      nightmare.emit("download", downloadPath, downloadItem);
    }
  });

  nightmare
    .downloadManager()
    .goto(acceptEUAFromUrl)
    .wait("#intel-licensed-dls-step-1")
    .check("#intel-licensed-dls-step-1 input[name='accept_license']")
    .click("#intel-licensed-dls-step-1 input[type='submit']")
    .wait("#intel-licensed-dls-step-2")
    .evaluate((sdeTarName) => {
      document.querySelector(`a[href*="${sdeTarName}"]`).click();
    }, sdeTarName)
    .waitDownloadsComplete()
    .end()
    .then(async () => {
      _7z.unpack(downloadPath, outputDir, err => {
        dumpDirectory(outputDir);

        _7z.unpack(tarPath, outputDir, err => {
          dumpDirectory(outputDir);
        });
      });

      console.log(`done`);
      // core.exportVariable(envName, cachedPath);
    });
} catch (error) {
  core.setFailed(error.message);
}

function dumpDirectory(path) {
  fs.readdir(path, function (err, items) {
    if (items) {
      console.log(items);
    } else {
      console.log(`Empty.`);
    }
  });
}