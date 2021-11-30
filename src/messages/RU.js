/* eslint-disable */
const AGREE = 'Я прочитал и согласен';
const DEL_P = 'Вы действительно хотите удалить маршрут? Вы уверены?';
const DIST_P = 'Укажите максимальный радиус расстояния в метрах для поиска';
const CREATE_P = 'Введите название';
const CREATE = `Шаг 1. ${CREATE_P} *регулярного*(ежедневного) маршрута
Просто напишите текстом`;

const TGPH_LINK = 'https://telegra.ph/Route-Cab-Russkaya-versiya-11-10';

const START = `Пожалуйста прочтите информацию о боте, перед началом ${TGPH_LINK}`;

const MENU = 'Меню';

const SEND_R = 'Отправить заявку на совместную поездку';

const SEND_R3 = 'Предложить объединиться на совместные поездки';
const SEND_RNOTIFY = 'Подписаться на обновления';

const ROUTE_EX = 'Маршрут с таким именем уже существует';
const ROUTE_LIST = 'Выберите маршрут из списка ниже:';
const ROUTE_ADDED = 'Маршрут успешно добавлен';

const STATUS_ON = 'Вкл.';
const STATUS_OFF = 'Выкл.';

const STATUS_ON_P = 'Маршрут активирован. Уведомления включены';
const STATUS_OFF_P = 'Маршрут выключен. Уведомления выключены';

const STATUS_SUB_ON = 'Уведомления вкл.';
const STATUS_SUB_OFF = 'Уведомления выкл.';
const NOTIFY_ON = 'Включить уведомления';
const CHANGED = 'Тип изменен';
const SEARCH = 'Найти похожие маршруты рядом';
const SEARCH_P = 'Найти водителей с похожими маршрутами рядом';
const HELLO = 'Отлично! Пожалуйста Выберите тип аккаунта!';

const HELP_POINT = `Используйте кнопку - 📎 или
пришлите координаты, пример:
\`\`\`XX.XXXXXX,XX.XXXXXX\`\`\`
где Х - цифра
`;


const ROUTE_SAME = 'Похожие маршруты рядом не найдены';
const ROUTE_SAME_D = 'Похожие маршруты (с водителями) рядом не найдены';
const ROUTE_STOP = 'Все маршруты отключены';
const POINT_1 = `Шаг 2. Прикрепите ваши координаты (локацию) пункт отправления (точка А)
${HELP_POINT}`;
const POINT_2 = `Шаг 3. Прикрепите ваши координаты (локацию) пункт прибытия (точка Б)
${HELP_POINT}`;

const TYPE_1 = '🚘 Водитель (свое авто)';
const TYPE_2 = '🚖 Водитель (каршеринг)';
const TYPE_3 = '🐶 Пассажир';

const NO_USERNAME = `Внимание! У вас не настроен username в вашем профиле телеграм. 
Пожалуйста установите username чтобы с вами могли связаться все участники маршрута`;

const SETTING_TEXT = `Настройки:
- Вы можете изменить тип аккаунта
- Отключить все активные маршруты`

module.exports = {
  'TYPE_1': TYPE_1,
  'TYPE_2': TYPE_2,
  'TYPE_3': TYPE_3,
  'POINT_1': POINT_1,
  'POINT_2': POINT_2,
  'STOP_ALL': 'Откл. все активные маршруты',
  'ROUTE_STOP': ROUTE_STOP,
  'ROUTE_SAME_D': ROUTE_SAME_D,
  'ROUTE_SAME': ROUTE_SAME,
  'HELLO': HELLO,
  'I have set the username': 'Я установил username',
  'Delete route': 'Удалить',
  'Delete': 'Удалить',
  'Edit': 'Редактировать',
  'Enable': 'Включить',
  'Disable': 'Выключить',
  'Disable notifications': 'Выключить уведомления',
  'Routes List': 'Список Маршрутов',
  'to Route': 'к маршруту',
  'Back': 'Назад',
  'Add route': 'Добавить маршрут',
  'Send name of the route': 'Придумайте имя',
  'Settings': 'Настройки',
  'Change account type': 'Изменить тип',
  'about': 'о боте',
  'My Routes': 'Мои маршруты',
  'Change time': 'Изменить время маршрута',
  'Change start time': 'Изменить время начала',
  'Change return time': 'Изменить время обратно',

  'DEL_P': DEL_P,
  'CREATE_P': CREATE_P,
  'CREATE': CREATE,
  'AGREE': AGREE,
  'TGPH_LINK': TGPH_LINK,
  'START': START,
  'MENU': MENU,
  'SEND_R': SEND_R,
  'SEND_R3': SEND_R3,
  'SEND_RNOTIFY': SEND_RNOTIFY,
  'ROUTE_EX': ROUTE_EX,
  'ROUTE_LIST': ROUTE_LIST,
  'ROUTE_ADDED': ROUTE_ADDED,
  'STATUS_ON': STATUS_ON,
  'STATUS_OFF': STATUS_OFF,
  'STATUS_ON_P': STATUS_ON_P,
  'STATUS_OFF_P': STATUS_OFF_P,
  'STATUS_SUB_ON': STATUS_SUB_ON,
  'STATUS_SUB_OFF': STATUS_SUB_OFF,
  'NOTIFY_ON': NOTIFY_ON,
  'CHANGED': CHANGED,
  'SEARCH': SEARCH,
  'SEARCH_P': SEARCH_P,
  'Username is not set': 'Username не установлен',
  'Username saved': 'Username сохранен',
  'Send my current location as departure': 'Отправить текущее место положение Точка А',
  'Send my current location as destination': 'Отправить текущее место положение Точка Б',
  'Route deleted': 'Маршрут удален',
  'Yes delete this route': 'Да удалить маршрут',
  'No': 'Нет',
  'Request sent': 'Запрос отправлен' ,
  'Offer sent': 'Предложение отправлено',
  'Route name': 'Наименование',
  'Status': 'Статус' ,
  'Notifications': 'Уведомления',
  'Time': 'Время' ,
  'Start drive time': 'Туда в',
  'Return time': 'Обратно в' ,
  'departure point': 'Точка А' ,
  'destination point': 'Точка Б' ,
  'Hello': 'Привет!',
  'Account type': 'Тип аккаунта',
  'Times saved': 'Время сохранено',

  'Select start route time from A (first point)': `Выберите время отправления из точки А
🕝
во сколько выезжаете ТУДА ➡️`,
  'Select back route time from B (from last point)': `Выберите время отправления из точки Б
🕝
во сколько выезжаете ОТТУДА ⬅️`,
  'Set start route time from A (first point)': 'Выберите время отправления из точки А',
  'Set back route time from B (from last point)': 'Выберите время отправления из точки Б',
  'NO_USERNAME': NO_USERNAME,
  'SETTING_TEXT': SETTING_TEXT,
  'You have already sent a request on this route': 'Вы уже отправляли запрос по этому маршруту',
  'You have already subscribed to route updates': 'Вы уже подписаны на обновления',
  'afternoon': 'полдень',
  'A similar route has been added to this route': 'По маршруту добавлен похожий маршрут',
  'There is an offer for joint trips on your route': 'По маршруту появилось предложение по совместным поездкам',
  'From': 'От',
  'User': 'Пользователь',
  'Route time is not defined': 'Время маршрута не установлено',
  'This user wants to ride with you along the route': 'С вами хочет кататься пользователь по маршруту',
  'Set distance for point A': 'Установить радиус поиска для точки А',
  'Set distance for point B': 'Установить радиус поиска для точки Б',
  'Distance saved': 'Дистанция сохранена',
  'DIST_P': DIST_P,
};
