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
const TYPE_1_RU = 'Я водитель (свое авто)';
const TYPE_2_RU = 'Я водитель (каршеринг)';
const TYPE_3_RU = 'Я пассажир';

const TYPE_1_EN = 'I am a driver (with car)';
const TYPE_2_EN = 'I am a car sharing driver (without car)';
const TYPE_3_EN = 'I am a passenger';

const MENU_RU = 'Меню';
const MENU_EN = 'Menu';

const ROUTE_LIST_RU = 'Выберите маршрут из списка ниже:';
const ROUTE_LIST_EN = 'Choose a route from the list below:';
const ROUTE_ADDED_RU = 'Маршрут успешно добавлен';
const ROUTE_ADDED_EN = 'Route added successfully';

const STATUS_ON_RU = 'Включен';
const STATUS_OFF_RU = 'Выключен';
const STATUS_ON_EN = 'Enabled';
const STATUS_OFF_EN = 'Disabled';
const CHANGED_RU = 'Тип изменен';
const CHANGED_EN = 'Account type changed';
const RU = 'ru';
const ARR_L = '«';
const SEARCH_RU = 'Найти похожие маршруты рядом';
const SEARCH_EN = 'Search the same route nearby';

const getStatus = (status, lang, icon) => {
  if (lang === RU) {
    return `${status === 0 ? STATUS_OFF_RU : STATUS_ON_RU} ${icon}`;
  }
  return `${status === 0 ? STATUS_OFF_EN : STATUS_ON_EN} ${icon}`;
};

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

module.exports = {
  check: lang => (lang === RU ? CREATE_P_RU : CREATE_P_EN),
  account: lang => (lang === RU ? CHANGED_RU : CHANGED_EN),
  success: lang => (lang === RU ? ROUTE_ADDED_RU : ROUTE_ADDED_EN),
  home: lang => (lang === RU ? MENU_RU : MENU_EN),
  start: lang => (lang === RU ? START_RU : START_EN),
  agree: lang => (lang === RU ? AGREE_RU : AGREE_EN),
  start2: lang => (lang === RU ? HELLO_RU : HELLO_EN),
  start3: lang => (lang === RU ? 'Привет!' : 'Hello!'),
  driverStartNewRoute: lang =>
    `${lang === RU ? CREATE_RU : CREATE_EN}
${lang === RU ? CREATE_TXT_L_RU : CREATE_TXT_L_EN}`,
  point: (routeType, lang) => {
    if (routeType === 1) {
      return `${lang === RU ? POINT_1_RU : POINT_1_EN}
${lang === RU ? POINT_TXT_L_RU : POINT_TXT_L_EN}`;
    }
    if (routeType === 2) {
      return `${lang === RU ? POINT_2_RU : POINT_2_EN}
${lang === RU ? POINT_TXT_L_RU : POINT_TXT_L_EN}`;
    }
    return 'error';
  },
  asDept: () => 'Send my current location as departure',
  asDest: () => 'Send my current location as destination',
  support: links => {
    let s = 'For support:';
    s += `${links.length ? `\n${links.join('\n\n')}` : ''}`;
    return s;
  },
  stoppedAll: lang => (lang === RU ? ROUTE_STOP_RU : ROUTE_STOP_EN),
  icon: status => `${status === 0 ? '🔴' : '🟢'}`,
  status: getStatus,
  routesList: lang => (lang === RU ? ROUTE_LIST_RU : ROUTE_LIST_EN),
  routesEmpty: lang => (lang === RU ? ROUTE_SAME_RU : ROUTE_SAME_EN),

  // menus
  driver: lang => (lang === RU ? TYPE_1_RU : TYPE_1_EN),
  sharing: lang => (lang === RU ? TYPE_2_RU : TYPE_2_EN),
  passenger: lang => (lang === RU ? TYPE_3_RU : TYPE_3_EN),
  activate: lang => (lang === RU ? 'Активировать' : 'Enable'),
  deactivate: lang => (lang === RU ? 'Выключить' : 'Disable'),
  back: lang => `${ARR_L} ${lang === RU ? 'Список Маршрутов' : 'Routes List'}`,
  backJust: lang => `${ARR_L} ${lang === RU ? 'Назад' : 'Back'}`,
  addRoute: lang => (lang === RU ? 'Добавить маршрут' : 'Add route'),
  addName: lang => (lang === RU ? 'Придумайте имя' : 'Send name of the route'),
  stopRoutes: l => (l === RU ? 'Откл. все маршруты' : 'Stop all Routes'),
  settings: l => (l === RU ? 'Настройки' : 'Settings'),
  changeType: lang => (lang === RU ? 'Изменить тип' : 'Change account type'),
  myRoutes: lang => (lang === RU ? 'Мои маршруты' : 'My Routes'),
  nearBy: lang => `👀 ${lang === RU ? SEARCH_RU : SEARCH_EN}`,
};
