const {Markup} = require('telegraf');

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
  settings: 'menu_settings',
};

function home(lang, txt = '') {
  return [
    {
      text: txt || messages.home(lang),
      callback_data: actions.startHome,
    },
  ];
}

function begin(lang) {
  const type1 = Markup.button.callback(messages.driver(lang), actions.driver);
  const type2 = Markup.button.callback(messages.sharing(lang), actions.sharing);
  const t = Markup.button.callback(messages.passenger(lang), actions.passenger);
  const back = home(lang);
  return Markup.inlineKeyboard([[type1, type2], [t], back]).resize();
}

function driver(lang, total) {
  const addRoute = messages.addRoute(lang);
  const settings1 = messages.settings(lang);
  const myRoutes = messages.myRoutes(lang);
  const addR = Markup.button.callback(addRoute, actions.addRoute);
  const st = Markup.button.callback(settings1, actions.settings);
  let btns = [[addR]];
  if (total) {
    btns = [[Markup.button.callback(myRoutes, actions.page1), addR]];
    btns.push([st]);
  }
  return Markup.inlineKeyboard(btns);
}
function settings(lang, total, hasActive = 0) {
  const changeType = messages.changeType(lang);
  const stop = messages.stopRoutes(lang);
  const ct = Markup.button.callback(changeType, actions.changeType);
  const st = Markup.button.callback(stop, actions.stopAll);
  const btns = [[ct]];
  if (total) {
    if (hasActive) {
      btns.push([st]);
    }
  }
  btns.push(home(lang, messages.backJust(lang)));
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
function locationBtn(txt) {
  return Markup.button.locationRequest(txt);
}
function loc1(txt) {
  return Markup.keyboard([locationBtn(txt)]);
}
function loc2(txt) {
  return Markup.keyboard([locationBtn(txt)]);
}

function next(lang) {
  const k = Markup.inlineKeyboard([
    {
      text: messages.next(lang),
      callback_data: 'next_process',
    },
  ]);
  k.parse_mode = 'Markdown';
  k.disable_web_page_preview = true;
  return k;
}

function nextProcess(routeType, lang) {
  let k;
  if (routeType === 1) {
    k = loc1(messages.asDept(lang));
  }
  if (routeType === 2) {
    k = loc2(messages.asDest(lang));
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
      text: messages.nearBy(lang),
      callback_data: callbacks[2],
    };
    keysArray = [keys, [findBtn]];
  }
  return Markup.inlineKeyboard(keysArray);
}
module.exports = {
  actions,
};
module.exports.begin = begin;
module.exports.driver = driver;
module.exports.startFirst = startFirst;
module.exports.hide = hide;
module.exports.nextProcess = nextProcess;
module.exports.fr = fr;
module.exports.inline = inline;
module.exports.home = home;
module.exports.settings = settings;
module.exports.editRoute = editRoute;
module.exports.next = next;
