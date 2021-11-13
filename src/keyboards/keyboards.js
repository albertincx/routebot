const {Markup} = require('telegraf');

const BUTTONS = require('../config/buttons');
const messages = require('../messages/format');

function start() {
  return Markup.keyboard([
    [BUTTONS.driver.label, BUTTONS.sharingDriver.label],
    [BUTTONS.passenger.label],
  ]).resize();
}
function driver(routes, hasActive = 0) {
  let btns = [[BUTTONS.addroute.label, BUTTONS.change_type.label]];
  if (routes === 3) {
    btns = [[BUTTONS.routes.label, BUTTONS.change_type.label]];
    if (hasActive) {
      btns.push([BUTTONS.stop_routes.label]);
    }
  }
  return Markup.keyboard(btns).resize();
}
function startFirst() {
  return Markup.inlineKeyboard([
    Markup.button.callback("I've read and agree", 'start_agree'),
  ]);
}
function hide() {
  return Markup.removeKeyboard();
}
function loc1() {
  return Markup.keyboard([
    Markup.button.locationRequest(messages.asDept()),
    BUTTONS.next.label,
  ]).resize();
}
function loc2() {
  return Markup.keyboard([
    Markup.button.locationRequest(messages.asDest()),
    BUTTONS.next.label,
  ]).resize();
}
function nextProcess(routeType) {
  if (routeType === 1) {
    return loc1();
  }
  if (routeType === 2) {
    return loc2();
  }
  return Markup.keyboard([BUTTONS.next.label]).resize();
}
function fr() {
  return Markup.forceReply();
}
function changeName(chatId) {
  return Markup.inlineKeyboard([
    Markup.button.callback('Change Name', `r_${chatId}`),
  ]);
}
function inline(keys) {
  return Markup.inlineKeyboard(keys);
}
function editRoute(callbacks, status) {
  const keys = [
    {
      text: BUTTONS.routes_back.label,
      callback_data: callbacks[0],
    },
    {
      text: (status === 1
        ? BUTTONS.routes_deaactivate
        : BUTTONS.routes_activate
      ).label,
      callback_data: callbacks[1],
    },
  ];
  return Markup.inlineKeyboard(keys);
}
module.exports.start = start;
module.exports.driver = driver;
module.exports.startFirst = startFirst;
module.exports.hide = hide;
module.exports.nextProcess = nextProcess;
module.exports.fr = fr;
module.exports.changeName = changeName;
module.exports.inline = inline;
module.exports.editRoute = editRoute;
