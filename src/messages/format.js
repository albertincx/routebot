const BUTTONS = require('../config/buttons');
const {
  CREATE_TXT_L_RU,
  CREATE_TXT_L_EN,
  POINT_TXT_L_EN,
  POINT_TXT_L_RU,
} = require('./links');

const CREATE_P_RU = 'Введите название';
const CREATE_P_EN = 'Enter the name of';
const CREATE_RU = `Шаг 1. ${CREATE_P_RU} *регулярного*(ежедневного) маршрута`;
const CREATE_EN = `${CREATE_P_EN} your regular (daily) route`;
const AGREE_EN = "I've read and agree";
const AGREE_RU = 'Я прочитал и согласен';

const TGPH_LINK = 'https://telegra.ph/Route-Cab-English-11-10';
const TGPH_LINK_RU = 'https://telegra.ph/Route-Cab-Russkaya-versiya-11-10';

const START_RU = `Пожалуйста прочтите информацию о боте, перед началом
${TGPH_LINK_RU}
  `;
const START_EN = `Hello! Please read information about this bot
${TGPH_LINK}
  `;

const MENU_RU = 'Меню';
const MENU_EN = 'Menu';
const SEND_R_RU = 'Отправить заявку на совместную поездку';
const SEND_R3_RU = 'Предложить объединиться на совместные поездки';
const SEND_R3_EN = 'Offer to unite for joint trips';
const ROUTE_EX_RU = 'Маршрут с таким именем уже существует';
const ROUTE_EX_EN = 'A route with the same name already exists';
const SEND_R_EN = 'Send request to drive';
const ROUTE_LIST_RU = 'Выберите маршрут из списка ниже:';
const ROUTE_LIST_EN = 'Choose a route from the list below:';
const ROUTE_ADDED_RU = 'Маршрут успешно добавлен';
const ROUTE_ADDED_EN = 'Route added successfully';

const STATUS_ON_RU = 'Включен';
const STATUS_OFF_RU = 'Выключен';
const STATUS_ON_EN = 'On';
const STATUS_OFF_EN = 'Off';

const STATUS_SUB_ON_RU = 'Вы подписались на уведомления';
const STATUS_SUB_OFF_RU = 'Вы отписались от уведомлений';
const STATUS_SUB_ON_EN = 'Subscribed';
const STATUS_SUB_OFF_EN = 'Unsubscribed';

const CHANGED_RU = 'Тип изменен';
const CHANGED_EN = 'Account type changed';
const RU = 'ru';
const ARR_L = '«';
const SEARCH_RU = 'Найти похожие маршруты рядом';
const SEARCH_EN = 'Find the same routes nearby';
const SEARCH_P_RU = 'Найти водителей с похожими маршрутами рядом';
const SEARCH_P_EN = 'Find drivers with similar nearby routes';

const HELLO_RU = 'Отлично! Пожалуйста Выберите тип аккаунта!';
const HELLO_EN = 'Hello! Please select type of your account!';
const ROUTE_SAME_RU = 'Похожие маршруты рядом не найдены';
const ROUTE_SAME_EN = 'Nearby same routes not found';
const ROUTE_STOP_RU = 'Все маршруты отключены';

const ROUTE_STOP_EN = 'Active routes stopped';

const HELP_POINT = `Используйте кнопку - 📎 или
пришлите координаты, пример:
59.939099, 30.315877
`;

const POINT_1_RU = `Шаг 2. Прикрепите ваши координаты (локацию) пункт отправления (точка А)
${HELP_POINT}`;
const POINT_1_EN = 'Send departure point (Start Point)';

const POINT_2_RU = `Шаг 3. Прикрепите ваши координаты (локацию) пункт прибытия (точка Б)
${HELP_POINT}`;
const POINT_2_EN = 'Send destination point (Last Point)';

const STOP_ALL_RU = 'Откл. все активные маршруты';
const STOP_ALL_EN = 'Stop all active Routes';

const TYPE_1_RU = BUTTONS.driver.labelRU;
const TYPE_2_RU = BUTTONS.sharingDriver.labelRU;
const TYPE_3_RU = BUTTONS.passenger.labelRU;

const TYPE_1_EN = BUTTONS.driver.label;
const TYPE_2_EN = BUTTONS.sharingDriver.label;
const TYPE_3_EN = BUTTONS.passenger.label;

const getStatus = (status, lang, icon, a = '') => {
  if (lang === RU) {
    return `${status === 0 ? STATUS_OFF_RU : STATUS_ON_RU}${a} ${icon}`;
  }
  return `${status === 0 ? STATUS_OFF_EN : STATUS_ON_EN} ${icon}`;
};
const getStatusSubscribe = (s, lang, icon) => {
  if (lang === RU) {
    return `${s === 0 || !s ? STATUS_SUB_OFF_RU : STATUS_SUB_ON_RU} ${icon}`;
  }
  return `${s === 0 || !s ? STATUS_SUB_OFF_EN : STATUS_SUB_ON_EN} ${icon}`;
};

const getType1 = lang => (lang === RU ? TYPE_1_RU : TYPE_1_EN);
const getType2 = lang => (lang === RU ? TYPE_2_RU : TYPE_2_EN);
const getType3 = lang => (lang === RU ? TYPE_3_RU : TYPE_3_EN);
const getTypeShow = (l, t) => {
  if (t === 1) {
    return getType1(l);
  }
  if (t === 2) {
    return getType2(l);
  }
  return getType3(l);
};
const getNearLabel = (l, t) => {
  let n = l === RU ? SEARCH_RU : SEARCH_EN;
  if (t) {
    n = l === RU ? SEARCH_P_RU : SEARCH_P_EN;
  }
  return `👀 ${n}`;
};
const typeLabel = lang => (lang === RU ? 'Тип аккаунта' : 'Account type');
const sentAlreadyPop = lang => {
  if (lang === RU) {
    return 'Вы уже отправляли запрос по этому маршруту';
  }
  return 'You have already sent a request on this route';
};
const showNotifyUser = (lang, name) => {
  if (lang === RU) {
    return `
По вашему маршруту "${name}" добавлен похожий маршрут
`;
  }
  return `
A similar route has been added to your route "${name}"
`;
};
const showNotifyUserDriver = (lang, name) => {
  if (lang === RU) {
    return `С вами хочет кататься пользователь по маршруту "${name}"`;
  }
  return `The user wants to ride with you along the route "${name}"`;
};
const showNotifyUserCoop = (lang, name) => {
  if (lang === RU) {
    return `По вашему маршруту "${name}" появилось предложение по совместным поездкам`;
  }
  return `There is an offer for joint trips on your route "${name}"`;
};

const showPoint = (routeType, lang) => {
  if (routeType === 1) {
    return `${lang === RU ? POINT_1_RU : POINT_1_EN}
${lang === RU ? POINT_TXT_L_RU : POINT_TXT_L_EN}`;
  }
  if (routeType === 2) {
    return `${lang === RU ? POINT_2_RU : POINT_2_EN}
${lang === RU ? POINT_TXT_L_RU : POINT_TXT_L_EN}`;
  }
  return 'error';
};

module.exports = {
  sentR: l => (l === RU ? 'Запрос отправлен' : 'Request sent'),
  sent3R: l => (l === RU ? 'Предложение отправлено' : 'Offer sent'),
  labelName: lang => (lang === RU ? 'Наименование' : 'Route name'),
  labelStatus: lang => (lang === RU ? 'Статус' : 'Status'),
  labelSubs: l => (l === RU ? 'Подписка на уведомления' : 'Subscription'),
  labelType: typeLabel,
  labelA: lang => (lang === RU ? 'Точка А' : 'departure point'),
  labelB: lang => (lang === RU ? 'Точка Б' : 'destination point'),
  check: lang => (lang === RU ? CREATE_P_RU : CREATE_P_EN),
  account: lang => (lang === RU ? CHANGED_RU : CHANGED_EN),
  success: lang => (lang === RU ? ROUTE_ADDED_RU : ROUTE_ADDED_EN),
  home: (lang, type) =>
    `${lang === RU ? MENU_RU : MENU_EN}
${typeLabel(lang)}: ${getTypeShow(lang, type)}`,
  start: lang => (lang === RU ? START_RU : START_EN),
  agree: lang => (lang === RU ? AGREE_RU : AGREE_EN),
  start2: lang => (lang === RU ? HELLO_RU : HELLO_EN),
  start3: lang => (lang === RU ? 'Привет!' : 'Hello!'),
  driverStartNewRoute: lang =>
    `${lang === RU ? CREATE_RU : CREATE_EN}
${lang === RU ? CREATE_TXT_L_RU : CREATE_TXT_L_EN}`,
  point: showPoint,
  asDept: () => 'Send my current location as departure',
  asDest: () => 'Send my current location as destination',
  support: links => {
    let s = 'For support:';
    s += `${links.length ? `\n${links.join('\n\n')}` : ''}`;
    return s;
  },
  stoppedAll: lang => (lang === RU ? ROUTE_STOP_RU : ROUTE_STOP_EN),
  icon: s => `${s === 0 || !s ? '🔴' : '🟢'}`,
  routesList: lang => (lang === RU ? ROUTE_LIST_RU : ROUTE_LIST_EN),
  routesEmpty: lang => (lang === RU ? ROUTE_SAME_RU : ROUTE_SAME_EN),
  getType: getTypeShow,
  notifyUser: showNotifyUser,
  notifyUserDriver: showNotifyUserDriver,
  notifyUserCoop: showNotifyUserCoop,
  showStatus: getStatus,
  statusSubscribe: getStatusSubscribe,
  sentAlready: sentAlreadyPop,
  // menus
  activate: lang => (lang === RU ? 'Активировать' : 'Enable'),
  deactivate: lang => (lang === RU ? 'Выключить' : 'Disable'),
  subscribe: lang => (lang === RU ? 'Подписаться на уведомления' : 'Subscribe'),
  unsubscribe: l => (l === RU ? 'Отписаться от уведомлений' : 'Unsubscribe'),
  back: lang => `${ARR_L} ${lang === RU ? 'Список Маршрутов' : 'Routes List'}`,
  backJust: lang => `${ARR_L} ${lang === RU ? 'Назад' : 'Back'}`,
  addRoute: lang => (lang === RU ? 'Добавить маршрут' : 'Add route'),
  addName: lang => (lang === RU ? 'Придумайте имя' : 'Send name of the route'),
  stopRoutes: l => (l === RU ? STOP_ALL_RU : STOP_ALL_EN),
  settings: l => (l === RU ? 'Настройки' : 'Settings'),
  changeType: lang => (lang === RU ? 'Изменить тип' : 'Change account type'),
  myRoutes: lang => (lang === RU ? 'Мои маршруты' : 'My Routes'),
  nearBy: getNearLabel,
  menu: lang => (lang === RU ? MENU_RU : MENU_EN),
  sendRequest: lang => (lang === RU ? SEND_R_RU : SEND_R_EN),
  sendRequest3: lang => (lang === RU ? SEND_R3_RU : SEND_R3_EN),
  routeExists: lang => (lang === RU ? ROUTE_EX_RU : ROUTE_EX_EN),
};
