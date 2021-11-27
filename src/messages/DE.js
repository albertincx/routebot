/* eslint-disable */
const AGREE = 'Ich habe es gelesen und verstanden';
const DEL_P = 'Du bist dabei, deine Route zu löschen. Bist du dir sicher?';
const CREATE_P = 'Gib den Namen ein für';
const CREATE = `${CREATE_P} deine Standard (tägliche) Route
Nur Text eintippen`;

const TGPH_LINK = 'https://telegra.ph/Route-Cab-English-11-10';

const START = `Bitte lies dir Informationen über diesen Bot durch ${TGPH_LINK}`;

const MENU = 'Menü';

const SEND_R = 'Stelle Anfrage zu fahren';

const SEND_R3 = 'Angebot zur Vereinigung für gemeinsames fahren';
const SEND_RNOTIFY = 'Abonniere Updates';

const ROUTE_EX = 'Es existiert schon eine Route mit demselben Namen';
const ROUTE_LIST = 'Wähle eine Route aus dieser LIste:';
const ROUTE_ADDED = 'Route erfolgreich hinzugefügt';

const STATUS_ON = 'An';
const STATUS_OFF = 'Aus';

const STATUS_ON_P = 'Route aktiviert. Benachrichtigungen angeschaltet.';
const STATUS_OFF_P = 'Route deaktiviert. Benachrichtigungen ausgeschaltet.';

const STATUS_SUB_ON = 'Benachrichtigungen angeschaltet';
const STATUS_SUB_OFF = 'Benachrichtigungen ausgeschaltet';
const NOTIFY_ON = 'Benachrichtigungen anschalten';
const CHANGED = 'Account-Typ geändert';
const SEARCH = 'Finde gleiche Routen in der Nähe';
const SEARCH_P = 'Finde Fahrer mit ähnlichen naheliegenden Routen ';

const HELLO = 'Hallo! Bitte wähle deinen Account-Typ!';

const ROUTE_SAME = 'Keine gleichen Routen in der Nähe gefunden';
const ROUTE_SAME_D = 'Keine gleichen Routen mit Fahrern in der Nähe gefunden';
const ROUTE_STOP = 'Aktive Routen gestoppt';
const POINT_1 = 'Sende Abreisepunkt (Startpunkt)';
const POINT_2 = 'Sende Zielpunkt (Letzer Punkt)';
const STOP_ALL = 'Stoppe alle aktiven Routen';

const TYPE_1 = '🚘 Fahrer (mit Auto)';
const TYPE_2 = '🚖 Auto-teilender Fahrer';
const TYPE_3 = '🐶 Passagier';

const NO_USERNAME = `Achtung! Du hast in deinem Telegram-Profil keinen Nutzernamen hinterlegt.
Bitte setze einen Nutznamen, damit alle Routenteilnehmer dich erreichen können.`;
const SETTING_TEXT = `Einstellungen:
- Du kannst deinen Account-Typ ändern 
- Alle akiven Routen deaktivieren`;

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
  'I have set the username': 'Ich habe einen Nutzernamen gesetzt',
  'Delete route': 'Route löschen',
  'Delete': 'löschen',
  'Edit': 'Ändern',
  'Enable': 'Aktivieren / Anschalten',
  'Disable': 'Deaktivieren / Ausschalten',
  'Disable notifications': 'Benachrichtigungen ausschalten',
  'Routes List': 'Liste der Routen',
  'to Route': 'zu der Route',
  'Back': 'Zurück',
  'Add route': 'Route hinzufügen',
  'Send name of the route': 'Namen der Route senden',
  'Settings': 'Einstellungen',
  'Change account type': 'Account-Typ ändern',
  'about': 'Über',
  'My Routes': 'Meine Routen',
  'Change time': 'Zeit ändern',
  'Change start time': 'Startzeit ändern',
  'Change return time': 'Rückkehr-Zeit ändern',
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
  'Username is not set': 'kein Nutzername gesetzt',
  'Username saved': 'Nutzername gespeichert',
  'Send my current location as departure': 'Sende meine aktuelle Position als Startpunkt',
  'Send my current location as destination': 'Setze meine aktuelle Position als Zielpunkt',
  'Route deleted': 'Route gelöscht',
  'Yes delete this route': 'Ja, diese ROute löschen',
  'No': 'Nein',
  'Request sent': 'Anfrage gesendet' ,
  'Offer sent': 'Angebot gesendet',
  'Route name': 'Routenname',
  'Status': 'Status' ,
  'Notifications': 'Benachrichtigungen',
  'Time': 'Zeit' ,
  'Start drive time': 'Start Fahrzeit',
  'Return time': 'Rückkehr-Zeit' ,
  'departure point': 'Startpunkt' ,
  'destination point': 'Zielpunkt' ,
  'Hello': 'Hallo!',
  'Account type': 'Account-Typ',
  'Times saved': 'Zeiten gespeichert',
  'NO_USERNAME': NO_USERNAME,
  'SETTING_TEXT': SETTING_TEXT,
  'afternoon': 'Nachmittag',
  'Route time is not defined': 'Routenzeit ist nicht definiert',
  'A similar route has been added to this route': 'Eine ähnliche Route wurde dieser Route hinzugefügt',
  'There is an offer for joint trips on your route': 'Es gibt ein Angebot für dich, dieser Route beizutreten',
  'From': 'von',
  'User': 'Nutzer',
  'This user wants to ride with you along the route': 'Dieser Nutzer möchte sich deiner Route anschließen',
  'You have already subscribed to route updates': "Du hast bereits Updates zu dieser Route abonniert",
  'You have already sent a request on this route': "Du hast bereits eine Anfrage zu dieser Route gesendet"
};
