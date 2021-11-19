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
  sendR: 'sendR',
  send3R: 'send3R',
};

function addRoute(lang) {
  const txt = messages.addRoute(lang);
  return [
    {
      text: txt,
      callback_data: actions.addRoute,
    },
  ];
}

function inline(keys, lang, toHome = false, back = false) {
  if (toHome) {
    keys.push([
      {
        text: (back && messages.backJust(lang)) || messages.menu(lang),
        callback_data: actions.startHome,
      },
    ]);
  }
  return Markup.inlineKeyboard(keys);
}

function begin(lang) {
  const t1 = messages.getType(lang, 1);
  const t2 = messages.getType(lang, 2);
  const t3 = messages.getType(lang, 3);
  const type1 = Markup.button.callback(t1, actions.driver);
  const type2 = Markup.button.callback(t2, actions.sharing);
  const t = Markup.button.callback(t3, actions.passenger);
  const keys = [[type1, type2], [t]];
  return inline(keys, lang, true);
}

function driver(lang, type) {
  const l = messages.settings(lang);
  const myRoutes = messages.myRoutes(lang);
  const s = Markup.button.callback(l, `${actions.settings}${type}`);
  const keys = [[Markup.button.callback(myRoutes, actions.page1)], [s]];
  return Markup.inlineKeyboard(keys);
}

function settings(lang, hasActive, type) {
  const changeType = messages.changeType(lang);
  const stop = messages.stopRoutes(lang);
  const c = Markup.button.callback(changeType, actions.changeType);
  const btns = [[c]];
  if (hasActive) {
    const s = Markup.button.callback(stop, `${actions.stopAll}${type}`);
    btns.push([s]);
  }
  return inline(btns, lang, true, true);
}

function startFirst(txt) {
  return Markup.inlineKeyboard([
    Markup.button.callback(txt, actions.startAgree),
  ]);
}

function hide(mark = false) {
  const k = Markup.removeKeyboard();
  if (mark) {
    k.parse_mode = 'Markdown';
    k.disable_web_page_preview = true;
  }
  return k;
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

function editRoute(lang, callbacks, status, notify) {
  const text =
    status === 1 ? messages.deactivate(lang) : messages.activate(lang);
  const text2 =
    notify === 1 ? messages.unsubscribe(lang) : messages.subscribe(lang);
  const keys = [
    {
      text: messages.back(lang),
      callback_data: callbacks[0],
    },
    {
      text,
      callback_data: callbacks[1],
    },
  ];
  const keysArray = [keys];
  keysArray.push([
    {
      text: text2,
      callback_data: callbacks[2],
    },
  ]);
  if (callbacks[3]) {
    const findBtn = {
      text: messages.nearBy(lang),
      callback_data: callbacks[3],
    };
    keysArray.push([findBtn]);
  }
  if (callbacks[4]) {
    const findBtn = {
      text: messages.nearBy(lang, true),
      callback_data: callbacks[4],
    };
    keysArray.push([findBtn]);
  }
  const k = inline(keysArray, lang, true);
  k.parse_mode = 'Markdown';
  k.disable_web_page_preview = true;
  return k;
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
module.exports.settings = settings;
module.exports.editRoute = editRoute;
module.exports.addRoute = addRoute;
