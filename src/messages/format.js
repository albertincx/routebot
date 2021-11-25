const BUTTONS = require('../config/buttons');
const getENV = require('../links');

const CREATE_P_RU = 'Введите название';
const DEL_P_RU = 'Вы действительно хотите удалить маршрут? Вы уверены?';
const DEL_P_EN = 'You are about to delete your route. Is that correct?';
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
const START_EN = `Please read information about this bot
${TGPH_LINK}
  `;

const MENU_RU = 'Меню';
const MENU_EN = 'Menu';

const SEND_R_RU = 'Отправить заявку на совместную поездку';
const SEND_R_EN = 'Send request to drive';

const SEND_R3_RU = 'Предложить объединиться на совместные поездки';
const SEND_R3_EN = 'Offer to unite for joint trips';
const SEND_RNOTIFY_RU = 'Подписаться на обновления';
const SEND_RNOTIFY_EN = 'Subscribe to updates';

const ROUTE_EX_RU = 'Маршрут с таким именем уже существует';
const ROUTE_EX_EN = 'A route with the same name already exists';
const ROUTE_LIST_RU = 'Выберите маршрут из списка ниже:';
const ROUTE_LIST_EN = 'Choose a route from the list below:';
const ROUTE_ADDED_RU = 'Маршрут успешно добавлен';
const ROUTE_ADDED_EN = 'Route added successfully';

const STATUS_ON_RU = 'Вкл.';
const STATUS_OFF_RU = 'Выкл.';
const STATUS_ON_EN = 'On';
const STATUS_OFF_EN = 'Off';

const STATUS_ON_P_RU = 'Маршрут активирован. Уведомления включены';
const STATUS_OFF_P_RU = 'Маршрут выключен. Уведомления выключены';
const STATUS_ON_P_EN = 'Route enabled. Notifications enabled';
const STATUS_OFF_P_EN = 'Route disabled. Notifications disabled';

const STATUS_SUB_ON_RU = 'Уведомления вкл.';
const STATUS_SUB_OFF_RU = 'Уведомления выкл.';
const STATUS_SUB_ON_EN = 'Notifications enabled';
const STATUS_SUB_OFF_EN = 'Notifications disabled';
const NOTIFY_ON_RU = 'Включить уведомления';
const NOTIFY_ON_EN = 'Enable notifications';
const CHANGED_RU = 'Тип изменен';
const CHANGED_EN = 'Account type changed';
const RU = 'ru';
const ARR_L = '«';
const SEARCH_RU = 'Найти похожие маршруты рядом';
const SEARCH_EN = 'Find the same routes nearby';
const SEARCH_P_RU = 'Найти водителей с похожими маршрутами рядом';
const SEARCH_P_EN = 'Find drivers with similar nearby routes';

const HELLO_RU = `Отлично! Пожалуйста Выберите тип аккаунта! ${getENV('ACC_T_L_RU')}`;
const HELLO_EN = `Hello! Please select type of your account! ${getENV('ACC_T_L_EN')}`;
const ROUTE_SAME_RU = 'Похожие маршруты рядом не найдены';
const ROUTE_SAME_EN = 'Same routes nearby not found';
const ROUTE_SAME_D_RU = 'Похожие маршруты (с водителями) рядом не найдены';
const ROUTE_SAME_D_EN = 'Same routes (with drivers) nearby not found';
const ROUTE_STOP_RU = 'Все маршруты отключены';

const ROUTE_STOP_EN = 'Active routes stopped';

const HELP_POINT = `Используйте кнопку - 📎 или
пришлите координаты, пример:
\`\`\`XX.XXXXXX, XX.XXXXXX\`\`\`
где Х - цифра
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

const getStatus = (status, lang, icon, pop = false) => {
  if (lang === RU) {
    if (pop) {
      return `${status === 0 ? STATUS_OFF_P_RU : STATUS_ON_P_RU} ${icon}`;
    }
    return `${status === 0 ? STATUS_OFF_RU : STATUS_ON_RU} ${icon}`;
  }
  if (pop) {
    return `${status === 0 ? STATUS_OFF_P_EN : STATUS_ON_P_EN} ${icon}`;
  }
  return `${status === 0 ? STATUS_OFF_EN : STATUS_ON_EN} ${icon}`;
};
const getStatusSubscribe = (lang, s, icon) => {
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

const typeLabel = (l, fromRoute) => {
  if (l === RU) {
    return `Тип ${fromRoute ? 'маршрута' : 'аккаунта'}`;
  }
  return 'Account type';
};

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
    return `
По вашему маршруту "${name}" добавлен похожий маршрут
`;
  }
  return `
A similar route has been added to your route "${name}"
`;
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

const showPoint = (routeType, lang) => {
  if (routeType === 1) {
    return `${lang === RU ? POINT_1_RU : POINT_1_EN}
${lang === RU ? getENV('POINT_TXT_L_RU') : getENV('POINT_TXT_L_EN')}`;
  }
  if (routeType === 2) {
    return `${lang === RU ? POINT_2_RU : POINT_2_EN}
${lang === RU ? getENV('POINT_TXT_L_RU') : getENV('POINT_TXT_L_EN')}`;
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
    return 'Select depa from B point time';
  }
  return 'Set depa from A point  time';
};

const editTimeSuccess = (lang, isFromB) => {
  if (lang === RU) {
    if (isFromB) {
      return 'Выберите время отправления из точки Б';
    }
    return 'Выберите время отправления из точки А';
  }
  if (isFromB) {
    return 'Select depa from B point time';
  }
  return 'Set depa from A point  time';
};
const editTimeOk = (lang, isFromB) => {
  if (lang === RU) {
    if (isFromB) {
      return 'Время сохранено';
    }
    return 'Время сохранено';
  }
  if (isFromB) {
    return 'Times saved';
  }
  return 'Times saved';
};

const showRoutesEmpty = (lang, t) => {
  if (lang === RU) {
    if (t) {
      return ROUTE_SAME_D_RU;
    }
    return ROUTE_SAME_RU;
  }
  if (t) {
    return ROUTE_SAME_D_EN;
  }
  return ROUTE_SAME_EN;
};

const iconWarn = () => '⚠ ';
const timeError = lang => {
  if (lang === RU) {
    // if (field) {
    //   return 'Время маршрута не установлено';
    // }
    return `${iconWarn()}Время маршрута не установлено`;
  }
  // if (field) {
  //   return 'Time is not defined';
  // }
  return `${iconWarn()}Route time is not defined`;
};
const noUserNameTxt2 = lang => {
  if (lang === RU) {
    // if (field) {
    //   return 'Время маршрута не установлено';
    // }
    return `${iconWarn()} Внимание! У вас не настроен username в вашем профиле телеграм. 
Пожалуйста установите username чтобы с вами могли связаться все участники маршрута`;
  }
  // if (field) {
  //   return 'Time is not defined';
  // }
  return `${iconWarn()} Attention! You do not have a "username" configured in your telegram profile.
Please set a "username" so that all route participants can contact you`;
};
const settingsText2 = lang => {
  if (lang === RU) {
    // if (field) {
    //   return 'Время маршрута не установлено';
    // }
    return `Настройки:
- Вы можете изменить тип аккаунта
- Отключить все активные маршруты ${getENV('SETT_T_L_RU')}`;
  }
  // if (field) {
  //   return 'Time is not defined';
  // }
  return `Settings:
- You can change your account type 
- Disable all active routes ${getENV('SETT_T_L_EN')}`;
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
  deletedRoute: l => (l === RU ? 'Маршрут удален' : 'Route deleted'),
  confirmDeletion: lang => (lang === RU ? DEL_P_RU : DEL_P_EN),
  yesRoute: l => (l === RU ? 'Да удалить маршрут' : 'Yes delete this route'),
  no: l => (l === RU ? 'Нет' : 'No'),
  sentR: l => (l === RU ? 'Запрос отправлен' : 'Request sent'),
  // sentNotify: l => (l === RU ? 'Подписка оформлена' : 'Subscription created'),
  sent3R: l => (l === RU ? 'Предложение отправлено' : 'Offer sent'),
  labelName: lang => (lang === RU ? 'Наименование' : 'Route name'),
  labelStatus: lang => (lang === RU ? 'Статус' : 'Status'),
  labelSubs: l => (l === RU ? 'Уведомления' : 'Notifications'),
  labelType: typeLabel,
  labelTime: l => (l === RU ? 'Время' : 'Time'),
  labelTimeA: l => (l === RU ? 'Туда в' : 'Start drive time'),
  labelTimeB: l => (l === RU ? 'Обратно в' : 'Return time'),
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
${lang === RU ? getENV('CREATE_TXT_L_RU') : getENV('CREATE_TXT_L_EN')}`,
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
  iconWarn,
  routesList: lang => (lang === RU ? ROUTE_LIST_RU : ROUTE_LIST_EN),
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
  editTimeOk,
  showHour: showHourTxt,
  noUserNameTxt: noUserNameTxt2,
  noUnameW: l => (l === RU ? 'Username не установлен' : 'Username is not set'),
  setUpUname: l => (l === RU ? 'Username сохранен' : 'Username saved'),
  timeError,
  settingsText: settingsText2,

  // menus
  editR: lang => (lang === RU ? 'Редактировать' : 'Edit'),
  activate: lang => (lang === RU ? 'Включить' : 'Enable'),
  deactivate: lang => (lang === RU ? 'Выключить' : 'Disable'),
  subscribe: l => (l === RU ? NOTIFY_ON_RU : NOTIFY_ON_EN),
  unsubscribe: l =>
    `🔕 ${l === RU ? 'Выключить уведомления' : 'Disable notifications'}`,
  back: lang => `${ARR_L} ${lang === RU ? 'Список Маршрутов' : 'Routes List'}`,
  backRoute: l => `${ARR_L} ${l === RU ? 'к маршруту' : 'to Route'}`,
  backJust: lang => `${ARR_L} ${lang === RU ? 'Назад' : 'Back'}`,
  addRoute: lang => (lang === RU ? 'Добавить маршрут' : 'Add route'),
  addName: lang => (lang === RU ? 'Придумайте имя' : 'Send name of the route'),
  stopRoutes: l => (l === RU ? STOP_ALL_RU : STOP_ALL_EN),
  settings: l => (l === RU ? 'Настройки' : 'Settings'),
  changeType: lang => (lang === RU ? 'Изменить тип' : 'Change account type'),
  aboutTxt: lang => (lang === RU ? 'о боте' : 'about'),
  myRoutes: lang => (lang === RU ? 'Мои маршруты' : 'My Routes'),
  changeHours: l => (l === RU ? 'Изменить время маршрута' : 'Change time'),
  changeHA: l => (l === RU ? 'Изменить время начала' : 'Change start time'),
  changeHB: l => (l === RU ? 'Изменить время обратно' : 'Change return time'),
  deleteRoute: l => `${l === RU ? 'Удалить маршрут' : 'Delete route'}`,
  nearBy: getNearLabel,
  menu: lang => (lang === RU ? MENU_RU : MENU_EN),
  sendRequest: lang => (lang === RU ? SEND_R_RU : SEND_R_EN),
  sendRequest3: lang => (lang === RU ? SEND_R3_RU : SEND_R3_EN),
  sendRequestNotify: lang => (lang === RU ? SEND_RNOTIFY_RU : SEND_RNOTIFY_EN),
  routeExists: lang => (lang === RU ? ROUTE_EX_RU : ROUTE_EX_EN),
  isUName: l => (l === RU ? 'Я установил username' : 'I have set the username'),
};
