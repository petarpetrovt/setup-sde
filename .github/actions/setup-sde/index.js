const core = require('@actions/core');
const github = require('@actions/github');
const Nightmare = require("nightmare");
const Electron = require('electron');

try {
  const nightmare = Nightmare({
    electronPath: Electron,
  });

  nightmare.goto('http://cnn.com')
    .evaluate(() => {
      return document.title;
    })
    .end()
    .then((title) => {
      console.log(title);
    });
} catch (error) {
  core.setFailed(error.message);
}