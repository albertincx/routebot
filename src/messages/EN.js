/* eslint-disable */
const BUTTONS = require('../config/buttons');
const AGREE = 'I have read and agree';
const DEL_P = 'You are about to delete your route. Is that correct?';
const DIST_P = 'Set maximum distance radius in meters for search';
const CREATE_P = 'Enter the name of';
const CREATE = `${CREATE_P} your regular (daily) route
Just type text`;

const TGPH_LINK = 'https://telegra.ph/Route-Cab-English-11-10';

const START = `Please read information about this bot ${TGPH_LINK}`;

const MENU = 'Menu';

const SEND_R = 'Send request to drive';

const SEND_R3 = 'Offer to unite for joint trips';
const SEND_RNOTIFY = 'Subscribe to updates';

const ROUTE_EX = 'A route with the same name already exists';
const ROUTE_LIST = 'Choose a route from the list below:';
const ROUTE_ADDED = 'Route added successfully';

const STATUS_ON = 'On';
const STATUS_OFF = 'Off';

const STATUS_ON_P = 'Route enabled. Notifications enabled';
const STATUS_OFF_P = 'Route disabled. Notifications disabled';

const STATUS_SUB_ON = 'Notifications enabled';
const STATUS_SUB_OFF = 'Notifications disabled';
const NOTIFY_ON = 'Enable notifications';
const CHANGED = 'Account type changed';
const SEARCH = 'Find the same routes nearby';
const SEARCH_P = 'Find drivers with similar nearby routes';

const HELLO = 'Hello! Please select type of your account!';

const ROUTE_SAME = 'Same routes nearby not found';
const ROUTE_SAME_D = 'Same routes (with drivers) nearby not found';
const ROUTE_STOP = 'Active routes stopped';
const POINT_1 = 'Send departure point (Start Point)';
const POINT_2 = 'Send destination point (Last Point)';
const STOP_ALL = 'Stop all active Routes';

const TYPE_1 = BUTTONS.driver.label;
const TYPE_2 = BUTTONS.sharingDriver.label;
const TYPE_3 = BUTTONS.passenger.label;
const NO_USERNAME = `Attention! You do not have a "username" configured in your telegram profile.
Please set a "username" so that all route participants can contact you`;
const SETTING_TEXT = `Settings:
- You can change your account type 
- Disable all active routes`

module.exports = {
  'TYPE_1': TYPE_1,
  'TYPE_2': TYPE_2,
  'TYPE_3': TYPE_3,
  'POINT_1': POINT_1,
  'POINT_2': POINT_2,
  'STOP_ALL': STOP_ALL,
  'ROUTE_STOP': ROUTE_STOP,
  'ROUTE_SAME_D': ROUTE_SAME_D,
  'ROUTE_SAME': ROUTE_SAME,
  'HELLO': HELLO,
  'I have set the username': 'Я установил username',
  'DEL_P': DEL_P,
  'DIST_P': DIST_P,
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
  'SETTING_TEXT': SETTING_TEXT,
  'NO_USERNAME': NO_USERNAME,
};
