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

function withHome(lang, keysArray) {
  const k = inline(keysArray, lang, true);
  k.parse_mode = 'Markdown';
  k.disable_web_page_preview = true;
  return k;
}

function addRoute(lang) {
  const txt = messages.addRoute(lang);
  return [
    {
      text: txt,
      callback_data: actions.addRoute,
    },
  ];
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

function detailRoute(lang, callbacks) {
  const keys = [
    {
      text: messages.back(lang),
      callback_data: callbacks[0],
    },
    {
      text: messages.editR(lang),
      callback_data: callbacks[1],
    },
  ];
  const keysArray = [keys];
  if (callbacks[2]) {
    const findBtn = {
      text: messages.nearBy(lang),
      callback_data: callbacks[2],
    };
    keysArray.push([findBtn]);
  }
  if (callbacks[3]) {
    const findBtn = {
      text: messages.nearBy(lang, true),
      callback_data: callbacks[3],
    };
    keysArray.push([findBtn]);
  }
  return withHome(lang, keysArray);
}

function editRoute(lang, callbacks, status, notify) {
  const text =
    status === 1 ? messages.deactivate(lang) : messages.activate(lang);
  const text2 =
    notify === 1 ? messages.unsubscribe(lang) : messages.subscribe(lang);
  const keys = [
    {
      text: messages.backRoute(lang),
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
  keysArray.push([
    {
      text: messages.changeHours(lang),
      callback_data: callbacks[3],
    },
  ]);
  keysArray.push([
    {
      text: messages.deleteRoute(lang),
      callback_data: callbacks[4],
    },
  ]);
  return withHome(lang, keysArray);
}

function getHour(ho, m = '00') {
  const h = `${ho < 10 ? '0' : ''}${ho}`;
  return `${h}:${m}`;
}

function editTimeKeys(lang, when, isFromB, cbPath) {
  const m = [
    [0, 6, 12, 18],
    [0.1, 6.1, 12.1, 18.1],
    [1, 7, 13, 19],
    [1.1, 7.1, 13.1, 19.1],
    [2, 8, 14, 20],
    [2.1, 8.1, 14.1, 20.1],
    [3, 9, 15, 21],
    [3.1, 9.1, 15.1, 21.1],
    [4, 10, 16, 22],
    [4.1, 10.1, 16.1, 22.1],
    [5, 11, 17, 23],
    [5.1, 11.1, 17.1, 23.1],
  ];
  return m.map(a =>
    a.map(i => {
      const h = parseInt(i, 10);
      return {
        text: getHour(h, `${i}`.match('.1') ? 30 : '00'),
        callback_data: `${cbPath}_${isFromB ? `time_${h}` : h}`,
      };
    }),
  );
}

function editTime(lang, when, isFromB, cbPath, keys = false) {
  const keysArray = editTimeKeys(lang, when, isFromB, cbPath);
  if (keys) {
    return keysArray;
  }
  return withHome(lang, keysArray);
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
module.exports.addRoute = addRoute;
module.exports.detailRoute = detailRoute;
module.exports.editRoute = editRoute;
module.exports.editTime = editTime;
module.exports.withHome = withHome;
