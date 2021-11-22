const _ = require('lodash');
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
  sendDriverReq: 'sendR',
  sendPassReq: 'send3R',
  sendNotify: 'send4R',
  allowReq1: 'allowReq1',
  allowReq2: 'allowReq2',
};

function inline(lang, keys, toHome = false, back = false) {
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

function withHome(lang, keysArray, toHome = true) {
  const k = inline(lang, keysArray, toHome);
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
  return inline(lang, keys, true);
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
  const keys = [[c]];
  if (hasActive) {
    const s = Markup.button.callback(stop, `${actions.stopAll}${type}`);
    keys.push([s]);
  }
  return inline(lang, keys, true, true);
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

function detailRoute(lang, callbacks, noTime = false) {
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
    if (noTime) {
      const findBtn = {
        text: `${messages.iconWarn()}${messages.changeHours(lang)}`,
        callback_data: callbacks[2],
      };
      keysArray.push([findBtn]);
    } else {
      const findBtn = {
        text: messages.nearBy(lang),
        callback_data: callbacks[2],
      };
      keysArray.push([findBtn]);
    }
  }
  if (callbacks.length === 4) {
    if (callbacks[3]) {
      const findBtn = {
        text: messages.nearBy(lang, true),
        callback_data: callbacks[3],
      };
      keysArray.push([findBtn]);
    }
  }
  return withHome(lang, keysArray);
}

function editRoute(lang, callbacks, route) {
  const {status, notify, hourA, hourB} = route;
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
  let text3;
  const callB3 = callbacks[3];
  let callB2;
  let callB4;
  if (Number.isNaN(hourA) || !hourB) {
    text3 = `${messages.iconWarn()}${messages.changeHours(lang)}`;
    callB2 = [
      {
        text: text3,
        callback_data: callB3,
      },
    ];
  } else {
    text3 = `${!hourA ? messages.iconWarn() : ''}${messages.changeHA(lang)}`;
    const t4 = `${!hourB ? messages.iconWarn() : ''}${messages.changeHB(lang)}`;
    callB4 = [
      {
        text: text3,
        callback_data: callbacks[5],
      },
      {
        text: t4,
        callback_data: callbacks[6],
      },
    ];
  }
  if (callB4) {
    keysArray.push(callB4);
  } else {
    keysArray.push(callB2);
  }
  keysArray.push([
    {
      text: messages.deleteRoute(lang),
      callback_data: callbacks[4],
    },
  ]);
  return withHome(lang, keysArray);
}

function editTimeKeys(lang, isB, cbPath, fromAVal) {
  let arr = [];
  for (let i = 0; i < 24; i += 1) {
    if (!fromAVal || fromAVal < i) {
      arr.push(i);
      if (i !== 12 || fromAVal) {
        arr.push(i + 0.3);
      }
    }
  }
  arr = _.chunk(arr, 5);
  if (!fromAVal) {
    arr.splice(5, 0, [12.3]);
  }
  return arr.map(a =>
    a.map(i => {
      const h = parseInt(i, 10);
      const min = `${i}`.match(/\.3/);
      return {
        text: messages.showHour(lang, i),
        callback_data: `${cbPath}_${isB ? 'time_' : ''}${h}${min ? '.3' : ''}`,
      };
    }),
  );
}

function editTime(lang, isFromB, cbPath, fromAVal) {
  return editTimeKeys(lang, isFromB, cbPath, fromAVal);
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
module.exports.settings = settings;
module.exports.addRoute = addRoute;
module.exports.detailRoute = detailRoute;
module.exports.editRoute = editRoute;
module.exports.editTime = editTime;
module.exports.withHome = withHome;
