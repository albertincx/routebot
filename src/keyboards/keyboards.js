const {Markup} = require('telegraf');

const BUTTONS = require('../config/buttons');

function start() {
  return Markup.keyboard([
    [BUTTONS.driver.label, BUTTONS.sharingDriver.label],
    [BUTTONS.passenger.label],
  ]);
}
function driver() {
  return Markup.keyboard([
    [BUTTONS.routes.label, BUTTONS.change_type.label],
    [BUTTONS.stop_routes.label],
  ]);
}
function startFirst() {
  return Markup.inlineKeyboard([
    Markup.button.callback("I've read and agree", 'start_agree'),
  ]);
}
function hide() {
  return Markup.removeKeyboard();
}
function next() {
  return Markup.keyboard([[BUTTONS.next.label]]);
}
module.exports.start = start;
module.exports.driver = driver;
module.exports.startFirst = startFirst;
module.exports.hide = hide;
module.exports.next = next;
