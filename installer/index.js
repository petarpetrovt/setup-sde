const core = require("@actions/core");
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

async function getSDEPath(downloadUrl) {
  const outputDir = path.resolve(`.output`);
  const tarBzPath = path.join(outputDir, `sde-temp-file.tar.bz2`);
  const tarPath = path.join(outputDir, `sde-temp-file.tar`);
  const filesPath = path.join(outputDir, `sde-temp-files`);
  const nightmare = Nightmare();

  nightmare.on("download", function (state, downloadItem) {
    if (state == "started") {
      nightmare.emit("download", tarBzPath, downloadItem);
    }
  });

  await nightmare
    .downloadManager()
    .goto(downloadUrl)
    .wait(".editorialPostContent")
    .evaluate((selector) => {
      const url = document.querySelector(selector).attributes["href"].value;
      document.location.replace(url);
    }, getOSHyperLinkSelector())
    .waitDownloadsComplete()
    .end()
    .catch(error => {
      throw new Error(`Failed to download SDE. Exception: ${error}`);
    });

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
    const environmentVariableName = core.getInput("environmentVariableName") || "SDE_PATH";
    core.info(`environmentVariableName: ${environmentVariableName}`);

    if (!environmentVariableName || environmentVariableName.length <= 0) {
      core.setFailed("Missing enviroment variable name.");
      return;
    }

    // TODO: argument
    const downloadUrl = "https://software.intel.com/content/www/us/en/develop/articles/pre-release-license-agreement-for-intel-software-development-emulator-accept-end-user-license-agreement-and-download.html";
    const sdePath = await getSDEPath(downloadUrl);

    core.exportVariable(environmentVariableName, sdePath);
  } catch (e) {
    core.setFailed(`An error has occured while setuping SDE binaries: ${e.message}`);
  }
}

run();