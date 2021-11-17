const NAME_MESSAGE = 'Enter the name of your route';
const NAME_MESSAGE_RU = 'Введите название регулярного маршрута';
const CR = 'Create your *regular* route';
const AGREE_EN = "I've read and agree";
const AGREE_RU = 'Я прочитал и согласен';
const TGPH_LINK = 'https://telegra.ph/Route-Cab-English-11-10';
const TGPH_LINK_RU = 'https://telegra.ph/Route-Cab-Russkaya-versiya-11-10';
const CHECK_MESSAGE_URL = `[what's it mean?](${TGPH_LINK})`;
const CHECK_MESSAGE_URL_RU = `[что это?](${TGPH_LINK_RU})`;

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

module.exports = {
  account: lang => (lang === RU ? CHANGED_RU : CHANGED_EN),
  success: lang => (lang === RU ? ROUTE_ADDED_RU : ROUTE_ADDED_EN),
  home: lang => (lang === RU ? MENU_RU : MENU_EN),
  check: lang => (lang === RU ? NAME_MESSAGE_RU : NAME_MESSAGE),
  start: lang => (lang === RU ? START_RU : START_EN),
  agree: lang => (lang === RU ? AGREE_RU : AGREE_EN),
  start2: lang => (lang === RU ? HELLO_RU : HELLO_EN),
  start3: lang => (lang === RU ? 'Привет!' : 'Hello!'),
  driverStartNewRoute: lang => `${CR} ${CHECK_MESSAGE_URL}`,
  driverNewRoute: lang => `${NAME_MESSAGE}`,
  point: (routeType, lang) => {
    if (routeType === 1) {
      return `${CR} ${CHECK_MESSAGE_URL}
Send departure point (Start Point)`;
    }
    if (routeType === 2) {
      return `${CR} ${CHECK_MESSAGE_URL}
Send destination point (Last Point)`;
    }
    return 'error';
  },
  support: links => {
    let s = 'For support:';
    s += `${links.length ? `\n${links.join('\n\n')}` : ''}`;
    return s;
  },
  asDept: () => 'Send my current location as departure',
  asDest: () => 'Send my current location as destination',
  stoppedAll: lang => 'Active routes stopped',
  icon: status => `${status === 0 ? '🔴' : '🟢'}`,
  status: getStatus,

  routesList: lang => (lang === RU ? ROUTE_LIST_RU : ROUTE_LIST_EN),
  routesEmpty: lang => (lang === RU ? 'Маршруты отсутствуют' : 'No routes'),
  next: lang => (lang === RU ? 'Далее' : 'Next'),
  // menus
  driver: lang => (lang === RU ? TYPE_1_RU : TYPE_1_EN),
  sharing: lang => (lang === RU ? TYPE_2_RU : TYPE_2_EN),
  passenger: lang => (lang === RU ? TYPE_3_RU : TYPE_3_EN),
  activate: lang => (lang === RU ? 'Активировать' : 'Enable'),
  deactivate: lang => (lang === RU ? 'Выключить' : 'Disable'),
  back: lang => `${ARR_L} ${lang === RU ? 'Список Маршрутов' : 'Routes List'}`,
  backJust: lang => `${ARR_L} ${lang === RU ? 'Назад' : 'Back'}`,
  addRoute: lang => (lang === RU ? 'Добавить маршрут' : 'Add route'),
  stopRoutes: l => (l === RU ? 'Откл. все маршруты' : 'Stop all Routes'),
  settings: l => (l === RU ? 'Настройки' : 'Settings'),
  changeType: lang => (lang === RU ? 'Изменить тип' : 'Change account type'),
  myRoutes: lang => (lang === RU ? 'Мои маршруты' : 'My Routes'),
  nearBy: lang => `👀 ${lang === RU ? SEARCH_RU : SEARCH_EN}`,
};
