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

function driver(routes, hasActive = 0) {
  const addR = Markup.button.callback(BUTTONS.addroute.label, actions.addRoute);
  const st = Markup.button.callback(BUTTONS.stopRoutes.label, actions.stopAll);
  let btns = [
    [
      addR,
      Markup.button.callback(BUTTONS.changetype.label, actions.changeType),
    ],
  ];
  if (routes === 3) {
    btns = [
      [
        Markup.button.callback(BUTTONS.myroutes.label, actions.page1),
        Markup.button.callback(BUTTONS.changetype.label, actions.changeType),
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
  return Markup.keyboard([
    Markup.button.locationRequest(messages.asDept()),
    BUTTONS.next.label,
  ]);
}
function loc2() {
  return Markup.inlineKeyboard([
    Markup.button.locationRequest(messages.asDest()),
    BUTTONS.next.label,
  ]);
}
function nextProcess(routeType) {
  let k = Markup.keyboard([BUTTONS.next.label]);
  if (routeType === 1) {
    k = loc1();
  }
  if (routeType === 2) {
    k = loc2();
  }
  k = k.resize();
  if (routeType === 1 || routeType === 2 || routeType === 3) {
    k.parse_mode = 'Markdown';
    k.disable_web_page_preview = true;
  }
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
function home() {
  return [
    {
      text: 'Home',
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
