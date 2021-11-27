const getENV = require('../links');
const RUs = require('./RU');
const EN = require('./EN');
const DE = require('./DE');

const RU = 'ru';
const ARR_L = '« ';

function getLang(l, key, icon = '') {
  switch (l) {
    case 'ru':
      if (RUs[key]) {
        return `${icon}${RUs[key]}`;
      }
      break;
    case 'de':
      if (DE[key]) {
        return `${icon}${DE[key]}`;
      }
      break;
    default:
      break;
  }
  if (EN[key]) {
    return `${icon}${EN[key]}`;
  }
  return `${icon}${key}`;
}

function getLangLast(l, key) {
  let lan = '';
  switch (l) {
    case 'ru':
      lan = '_RU';
      break;
    case 'de':
      lan = '_DE';
      break;
    default:
      break;
  }
  return `${key}${lan}`;
}

const getType1 = l => getLang(l, 'TYPE_1');
const getType2 = l => getLang(l, 'TYPE_2');
const getType3 = l => getLang(l, 'TYPE_3');

const getTypeShow = (l, t) => {
  if (t === 1) {
    return getType1(l);
  }
  if (t === 2) {
    return getType2(l);
  }
  return getType3(l);
};

const getStatus = (status, l, icon, pop = false) => {
  if (pop) {
    return `${getLang(
      l,
      status === 0 ? 'STATUS_OFF_P' : 'STATUS_ON_P',
    )} ${icon}`;
  }
  return `${getLang(l, status === 0 ? 'STATUS_OFF' : 'STATUS_ON')} ${icon}`;
};

const getStatusSubscribe = (l, s, icon) =>
  `${getLang(l, s === 0 || !s ? 'STATUS_SUB_OFF' : 'STATUS_SUB_ON')} ${icon}`;

const getNearLabel = (l, t) => `👀 ${getLang(l, t ? 'SEARCH_P' : 'SEARCH')}`;

const typeLabel = l => `${getLang(l, 'Account type')}`;

const editSupLinkTxt = l => `${getENV(getLangLast(l, 'EDIT_TXT'))}`;

const sentAlreadyPop = (lang, not = false) => {
  if (not) {
    if (lang === RU) {
      return 'Вы уже подписаны на обновления';
    }
    return 'You have already subscribed to route updates';
  }
  if (lang === RU) {
    return 'Вы уже отправляли запрос по этому маршруту';
  }
  return 'You have already sent a request on this route';
};

const showNotifyUser = (lang, name) => {
  if (lang === RU) {
    return `По вашему маршруту "${name}" добавлен похожий маршрут`;
  }
  return `A similar route has been added to your route "${name}"`;
};

const showNotifyUserDriver = (lang, name, usernameFrom) => {
  if (lang === RU) {
    return `С вами хочет кататься пользователь @${usernameFrom} по маршруту "${name}"`;
  }
  return `The user @${usernameFrom} wants to ride with you along the route "${name}"`;
};

const showNotifyUserCoop = (lang, name, uFrom) => {
  if (lang === RU) {
    return `По вашему маршруту "${name}" появилось предложение по совместным поездкам от @${uFrom}`;
  }
  return `There is an offer from @${uFrom} for joint trips on your route "${name}"`;
};

const showPoint = (routeType, l) => {
  if (routeType === 1) {
    return `${getLang(l, 'POINT_1')}
${getENV(getLangLast(l, 'POINT_TXT_L'))}`;
  }
  if (routeType === 2) {
    return `${getLang(l, 'POINT_2')}
${getENV(getLangLast(l, 'POINT_TXT_L'))}`;
  }
  return 'error';
};
const editTime = (lang, isFromB) => {
  if (lang === RU) {
    if (isFromB) {
      return `Выберите время отправления из точки Б
🕝
во сколько выезжаете ОТТУДА ⬅️`;
    }
    return `Выберите время отправления из точки А
🕝
во сколько выезжаете ТУДА ➡️`;
  }
  if (isFromB) {
    return 'Select back route time from B (from last point)';
  }
  return 'Select start route time from A (first point)';
};

const editTimeSuccess = (lang, isFromB) => {
  if (lang === RU) {
    if (isFromB) {
      return 'Выберите время отправления из точки Б';
    }
    return 'Выберите время отправления из точки А';
  }
  if (isFromB) {
    return 'Set back route time from B (from last point)';
  }
  return 'Set start route time from A (first point)';
};
const editTimeOkTxt = l => getLang(l, 'Times saved');

const showRoutesEmpty = (l, t) => getLang(l, t ? 'ROUTE_SAME_D' : 'ROUTE_SAME');

const iconWarn = () => '⚠ ';

const timeErrorTxt = lang => {
  if (lang === RU) {
    return `${iconWarn()}Время маршрута не установлено`;
  }
  return `${iconWarn()}Route time is not defined`;
};

const noUserNameTxt2 = lang => {
  if (lang === RU) {
    return `${iconWarn()} Внимание! У вас не настроен username в вашем профиле телеграм. 
Пожалуйста установите username чтобы с вами могли связаться все участники маршрута`;
  }
  return `${iconWarn()} Attention! You do not have a "username" configured in your telegram profile.
Please set a "username" so that all route participants can contact you`;
};

const settingsText2 = l => {
  if (l === RU) {
    return `Настройки:
- Вы можете изменить тип аккаунта
- Отключить все активные маршруты ${getENV(getLangLast(l, 'SETT_T_L'))}`;
  }
  return `Settings:
- You can change your account type 
- Disable all active routes ${getLangLast(l, 'SETT_T_L')}`;
};

function showHourTxt(lang, hour, view = false) {
  const m = `${hour}`.match(/\.3/);
  let h = parseInt(hour, 10);
  if (lang === 'en' && h > 12) {
    h -= 12;
  }
  let txtHour = `${h}`;
  if (h < 10 && lang === RU) {
    txtHour = `0${h}`;
  }
  let min = '00';
  if (m) {
    min = '30';
  }
  const time = `${txtHour}:${min}`;
  let llang = '';
  if (lang === 'en') {
    llang = 'pm';
    if (hour < 13) {
      llang = 'am';
    }
  }
  let afternoon = '';
  if (hour === 12.3 && !view) {
    afternoon = lang === RU ? ' полдень' : ' afternoon';
  }
  return `${time}${llang}${afternoon}`;
}

module.exports = {
  deletedRoute: l => getLang(l, 'Route deleted'),
  yesRoute: l => getLang(l, 'Yes delete this route'),
  no: l => getLang(l, 'No'),
  sentR: l => getLang(l, 'Request sent'),
  sent3R: l => getLang(l, 'Offer sent'),
  labelName: l => getLang(l, 'Route name'),
  labelStatus: l => getLang(l, 'Status'),
  labelSubs: l => getLang(l, 'Notifications'),
  labelTime: l => getLang(l, 'Time'),
  labelTimeA: l => getLang(l, 'Start drive time'),
  labelTimeB: l => getLang(l, 'Return time'),
  labelA: l => getLang(l, 'departure point'),
  labelB: l => getLang(l, 'destination point'),
  start3: l => getLang(l, 'Hello!'),

  labelType: typeLabel,
  editSupLink: editSupLinkTxt,
  confirmDeletion: l => getLang(l, 'DEL_P'),
  check: l => getLang(l, 'CREATE_P'),
  account: l => getLang(l, 'CHANGED'),
  success: l => getLang(l, 'ROUTE_ADDED'),
  start: l => getLang(l, 'START'),
  agree: l => getLang(l, 'AGREE'),
  start2: l => `${getLang(l, 'HELLO')}${getENV('ACC_T_L')}`,

  home: (l, type) => `${getLang(l, 'MENU')}
${typeLabel(l)}: ${getTypeShow(l, type)}`,

  driverStartNewRoute: l => `${getLang(l, 'CREATE')}
${getENV(getLangLast(l, 'CREATE_TXT_L'))}`,

  point: showPoint,
  iconWarn,
  routesEmpty: showRoutesEmpty,
  getType: getTypeShow,
  notifyUser: showNotifyUser,
  notifyUserDriver: showNotifyUserDriver,
  notifyUserCoop: showNotifyUserCoop,
  showStatus: getStatus,
  statusSubscribe: getStatusSubscribe,
  sentAlready: sentAlreadyPop,
  editTime,
  editTimeSuccess,
  editTimeOk: editTimeOkTxt,
  showHour: showHourTxt,
  noUserNameTxt: noUserNameTxt2,
  timeError: timeErrorTxt,
  settingsText: settingsText2,
  asDept: l => getLang(l, 'Send my current location as departure'),
  asDest: l => getLang(l, 'Send my current location as destination'),
  stoppedAll: l => getLang(l, 'ROUTE_STOP'),
  routesList: l => getLang(l, 'ROUTE_LIST'),
  noUnameW: l => getLang(l, 'Username is not set'),
  setUpUname: l => getLang(l, 'Username saved'),
  // menus
  nearBy: getNearLabel,
  editR: l => getLang(l, 'Edit'),
  activate: l => getLang(l, 'Enable'),
  deactivate: l => getLang(l, 'Disable'),
  unsubscribe: l => getLang(l, 'Disable notifications', '🔕'),
  back: l => getLang(l, 'Routes List', ARR_L),
  backRoute: l => getLang(l, 'to Route', ARR_L),
  backJust: l => getLang(l, 'Back', ARR_L),
  addRoute: l => getLang(l, 'Add route'),
  addName: l => getLang(l, 'Send name of the route'),
  settings: l => getLang(l, 'Settings'),
  changeType: l => getLang(l, 'Change account type'),
  aboutTxt: l => getLang(l, 'about'),
  myRoutes: l => getLang(l, 'My Routes'),
  changeHours: l => getLang(l, 'Change time'),
  changeHA: l => getLang(l, 'Change start time'),
  changeHB: l => getLang(l, 'Change return time'),

  deleteRoute: l => getLang(l, 'Delete route'),
  isUName: l => getLang(l, 'I have set the username'),
  subscribe: l => getLang(l, 'NOTIFY_ON'),
  stopRoutes: l => getLang(l, 'STOP_ALL'),
  menu: l => getLang(l, 'MENU'),
  sendRequest: l => getLang(l, 'SEND_R'),
  sendRequest3: l => getLang(l, 'SEND_R3'),
  sendRequestNotify: l => getLang(l, 'SEND_RNOTIFY'),
  routeExists: l => getLang(l, 'ROUTE_EX'),
  icon: s => `${s === 0 || !s ? '🔴' : '🟢'}`,
  support: links => {
    let s = 'For support:';
    s += `${links.length ? `\n${links.join('\n\n')}` : ''}`;
    return s;
  },
};
