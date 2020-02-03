const core = require("@actions/core");
const Nightmare = require("nightmare");
const tc = require("@actions/tool-cache");
require("nightmare-download-manager")(Nightmare);

const acceptEUAFromUrl = "https://software.intel.com/protected-download/267266/144917";
const sdeTarName = "sde-external-8.35.0-2019-03-11-win.tar.bz2";

try {
  const envName = core.getInput("myInput");
  console.log(`EnvName: ${envName}`);

  const nightmare = Nightmare({
    show: false
  });

  nightmare.on("download", function (state, downloadItem) {
    if (state == "started") {
      nightmare.emit("download", `sde-temp-file.tar.bz2`, downloadItem);
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
      var extractedFolder = await tc.extractTar(`sde-temp-file.tar.bz2`, "sde-temp-files");

      console.log("done");
      console.log(extractedFolder);

      // const cachedPath = tc.cacheDir(extractedFolder, 'node', '12.7.0');
      // core.addPath(cachedPath);

      // core.exportVariable(envName, cachedPath);
    });
} catch (error) {
  core.setFailed(error.message);
}