const core = require('@actions/core');
const Nightmare = require("nightmare");

try {
  const nightmare = Nightmare();

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