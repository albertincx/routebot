const NAME_MESSAGE = 'Enter the name of your route';
const CR = 'Create your *regular* route';
const AGREE_EN = "I've read and agree";
const AGREE_RU = 'Я прочитал и согласен';
const TGPH_LINK = 'https://telegra.ph/Route-Cab-English-11-10';
const TGPH_LINK_RU = 'https://telegra.ph/Route-Cab-Russkaya-versiya-11-10';
const CHECK_MESSAGE_URL = `[what is it mean?](${TGPH_LINK})`;

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

module.exports = {
  check: NAME_MESSAGE,
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
  driverStartPoint: () => `${CR} ${CHECK_MESSAGE_URL}
Send departure point (Start Point)`,
  driverLastPoint: () => `${CR} ${CHECK_MESSAGE_URL}
Send destination point (Last Point)`,
  support: links => {
    let s = 'For support:';
    s += `${links.length ? `\n${links.join('\n\n')}` : ''}`;
    return s;
  },
  asDept: () => 'Send my current location as departure',
  asDest: () => 'Send my current location as destination',
  whatNext: () => 'Whats next?',
  stoppedAll: () => 'Active routes stopped',
  icon: status => `${status === 0 ? '🔴' : '🟢'}`,
  nearBy: () => '👀 Search the same route nearby',
  routesList: () => 'Choose a route from the list below:',
  routesEmpty: () => 'Empty list',
};
