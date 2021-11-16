const {Markup} = require('telegraf');

const BUTTONS = require('../config/buttons');
const messages = require('../messages/format');

const actions = {
  addRoute: 'add_route',
  stopAll: 'stop_all',
  changeType: 'change_type',
  page1: 'page_1',
  startAgree: 'start_agree',
  startHome: 'start_home',
  driver: 'type_1',
  sharing: 'type_2',
  passenger: 'type_3',
};

function begin(lang) {
  const type1 = Markup.button.callback(messages.driver(lang), actions.driver);
  const type2 = Markup.button.callback(messages.sharing(lang), actions.sharing);
  const t = Markup.button.callback(messages.passenger(lang), actions.passenger);
  return Markup.inlineKeyboard([[type1, type2], [t]]).resize();
}

function driver(lang, routes, hasActive = 0) {
  const addRoute = messages.addRoute(lang);
  const stopRoutes = messages.stopRoutes(lang);
  const changeType = messages.changeType(lang);
  const myRoutes = messages.myRoutes(lang);
  const addR = Markup.button.callback(addRoute, actions.addRoute);
  const st = Markup.button.callback(stopRoutes, actions.stopAll);
  let btns = [[addR, Markup.button.callback(changeType, actions.changeType)]];
  if (routes === 3) {
    btns = [
      [
        Markup.button.callback(myRoutes, actions.page1),
        Markup.button.callback(changeType, actions.changeType),
      ],
    ];
    btns.push([addR]);
    if (hasActive) {
      btns.push([st]);
    }
  }
  return Markup.inlineKeyboard(btns);
}

function startFirst(txt) {
  return Markup.inlineKeyboard([
    Markup.button.callback(txt, actions.startAgree),
  ]);
}

function hide() {
  return Markup.removeKeyboard();
}
function loc1() {
  return Markup.keyboard([Markup.button.locationRequest(messages.asDept())]);
}
function loc2() {
  return Markup.keyboard([Markup.button.locationRequest(messages.asDest())]);
}
function nextProcess(routeType) {
  let k;
  if (routeType === 1) {
    k = loc1();
  }
  if (routeType === 2) {
    k = loc2();
  }
  k = k.resize();
  k.parse_mode = 'Markdown';
  k.disable_web_page_preview = true;
  return k;
}
function fr() {
  const k = Markup.forceReply();
  k.parse_mode = 'Markdown';
  k.disable_web_page_preview = true;
  return k;
}

function inline(keys) {
  return Markup.inlineKeyboard(keys);
}
function editRoute(lang, callbacks, status) {
  const keys = [
    {
      text: messages.back(lang),
      callback_data: callbacks[0],
    },
    {
      text: status === 1 ? messages.deactivate(lang) : messages.activate(lang),
      callback_data: callbacks[1],
    },
  ];
  let keysArray = keys;
  if (callbacks[2]) {
    const findBtn = {
      text: messages.nearBy(),
      callback_data: callbacks[2],
    };
    keysArray = [keys, [findBtn]];
  }
  return Markup.inlineKeyboard(keysArray);
}

function home(lang) {
  return [
    {
      text: messages.home(lang),
      callback_data: actions.startHome,
    },
  ];
}

module.exports.begin = begin;
module.exports.driver = driver;
module.exports.startFirst = startFirst;
module.exports.hide = hide;
module.exports.nextProcess = nextProcess;
module.exports.fr = fr;
module.exports.inline = inline;
module.exports.editRoute = editRoute;
module.exports.home = home;
module.exports.actions = actions;
