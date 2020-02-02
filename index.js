const core = require('@actions/core');
const github = require('@actions/github');

try {
  const osName = core.getInput('os');
  console.log(`The OS name: ${osName}`);

  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}