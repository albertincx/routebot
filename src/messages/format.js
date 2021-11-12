const CHECK_MESSAGE = 'Send the name of your route';
module.exports = {
  check: CHECK_MESSAGE,
  start: () => `Hello! Please select type of your account!
https://telegra.ph/Route-Cab-English-11-10
  `,
  start2: () => `Hello! Please select type of your account!
  1. I am a driver (with car)
  2. I am a car sharing driver (without car)
  3. I am a passenger
  `,
  start3: () => 'Hello!',
  driverNewRoute:
    () => `Create your regular route [what is it?](https://telegra.ph/Route-Cab-English-11-10)
${CHECK_MESSAGE}`,
  driverStartPoint: (name = '') => `${
    name ? `You already have a name "${name}"` : 'Create your first'
  } regular route [what is it?](https://telegra.ph/Route-Cab-English-11-10)
Send departure point`,
  driverLastPoint:
    () => `Create your first regular route [what is it?](https://telegra.ph/Route-Cab-English-11-10)
Send destination point`,
  support: links => {
    let s = 'For support:';
    s += `${links.length ? `\n${links.join('\n\n')}` : ''}`;
    return s;
  },
  asDept: () => 'Send my current location as departure',
  asDest: () => 'Send my current location as destination',
  whatNext: (name = '') =>
    `Whats next? ${name ? '\nIt looks like you already have a name' : ''}`,
};
