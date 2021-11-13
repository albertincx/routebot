const NAME_MESSAGE = 'Enter the name of your route';
const CR = 'Create your *regular* route';
const CHECK_MESSAGE_URL =
  '[what is it mean?](https://telegra.ph/Route-Cab-English-11-10)';
module.exports = {
  check: NAME_MESSAGE,
  start: () => `Hello! Please select type of your account!
https://telegra.ph/Route-Cab-English-11-10
  `,
  start2: () => `Hello! Please select type of your account!
  1. I am a driver (with car)
  2. I am a car sharing driver (without car)
  3. I am a passenger
  `,
  start3: () => 'Hello!',
  driverNewRoute: () => `${CR} ${CHECK_MESSAGE_URL}
${NAME_MESSAGE}`,
  driverStartPoint: () => `${CR} ${CHECK_MESSAGE_URL}
Send departure point (Start Point)`,
  driverLastPoint: () => `Create your first *regular* route ${CHECK_MESSAGE_URL}
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
  routeStatus: () => 'Status changed',
};
