const NAME_MESSAGE = 'Enter the name of your route';
const NAME_MESSAGE_RU = 'Введите название регулярного маршрута';
const CR = 'Create your *regular* route';
const AGREE_EN = "I've read and agree";
const AGREE_RU = 'Я прочитал и согласен';
const TGPH_LINK = 'https://telegra.ph/Route-Cab-English-11-10';
const TGPH_LINK_RU = 'https://telegra.ph/Route-Cab-Russkaya-versiya-11-10';
const CHECK_MESSAGE_URL = `[what's it mean?](${TGPH_LINK})`;

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

const getStatus = (status, lang, icon) => {
  if (lang === 'ru') {
    return `${status === 0 ? STATUS_OFF_RU : STATUS_ON_RU} ${icon}`;
  }
  return `${status === 0 ? STATUS_OFF_EN : STATUS_ON_EN} ${icon}`;
};

module.exports = {
  success: lang => (lang === 'ru' ? ROUTE_ADDED_RU : ROUTE_ADDED_EN),
  statusDone: lang => (lang === 'ru' ? ROUTE_ADDED_RU : ROUTE_ADDED_EN),
  home: lang => (lang === 'ru' ? MENU_RU : MENU_EN),
  check: lang => (lang === 'ru' ? NAME_MESSAGE_RU : NAME_MESSAGE),
  start: lang => (lang === 'ru' ? START_RU : START_EN),
  agree: lang => (lang === 'ru' ? AGREE_RU : AGREE_EN),
  start2: () => `Hello! Please select type of your account!
  1. ${TYPE_1_EN}
  2. ${TYPE_2_EN}
  3. ${TYPE_3_EN}
  `,
  start3: lang => (lang === 'ru' ? 'Привет!' : 'Hello!'),
  driver: lang => (lang === 'ru' ? TYPE_1_RU : TYPE_1_EN),
  sharing: lang => (lang === 'ru' ? TYPE_2_RU : TYPE_2_EN),
  passenger: lang => (lang === 'ru' ? TYPE_3_RU : TYPE_3_EN),
  driverNewRoute: () => `${CR} ${CHECK_MESSAGE_URL}
${NAME_MESSAGE}`,
  point: (routeType, lang) => {
    if (routeType === 1) {
      return `${CR} ${CHECK_MESSAGE_URL}
Send departure point (Start Point)`;
    }
    if (routeType === 2) {
      return `${CR} ${CHECK_MESSAGE_URL}
Send destination point (Last Point)`;
    }
  },
  support: links => {
    let s = 'For support:';
    s += `${links.length ? `\n${links.join('\n\n')}` : ''}`;
    return s;
  },
  asDept: () => 'Send my current location as departure',
  asDest: () => 'Send my current location as destination',
  stoppedAll: () => 'Active routes stopped',
  icon: status => `${status === 0 ? '🔴' : '🟢'}`,
  status: getStatus,
  nearBy: () => '👀 Search the same route nearby',
  routesList: lang => (lang === 'ru' ? ROUTE_LIST_RU : ROUTE_LIST_EN),
  routesEmpty: lang => (lang === 'ru' ? 'Маршруты отсутствуют' : 'No routes'),
  next: lang => (lang === 'ru' ? 'Далее' : 'Next'),
  activate: lang => (lang === 'ru' ? 'Активировать' : 'Activate'),
  deactivate: lang => (lang === 'ru' ? 'Выключить' : 'Deactivate'),
  back: lang => (lang === 'ru' ? 'Список Маршрутов' : 'Back to Routes List'),
  addRoute: lang => (lang === 'ru' ? 'Добавить маршрут' : 'Add route'),
  stopRoutes: l => (l === 'ru' ? 'Откл. все маршруты' : 'Stop all Routes'),
  changeType: lang => (lang === 'ru' ? 'Изменить тип' : 'Change account type'),
  myRoutes: lang => (lang === 'ru' ? 'Мои маршруты' : 'My Routes'),
};
