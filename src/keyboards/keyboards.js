const {Markup} = require('telegraf');

const BUTTONS = require('../config/buttons');

function start() {
  return Markup.keyboard([[BUTTONS.hello.label], [BUTTONS.support.label]]);
}

module.exports.start = start;
