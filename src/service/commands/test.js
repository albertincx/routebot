const fetch = require('node-fetch');

const {showError} = require('../../api/utils');

async function run(params, botHelper) {
  try {
    const url = process.env.TEST_API;
    if (!url) return;
    await fetch(url);
    await botHelper.sendAdmin('cron test check url', process.env.TGGROUPLOGS);
  } catch (e) {
    showError(e);
  }
}

module.exports = {run};
