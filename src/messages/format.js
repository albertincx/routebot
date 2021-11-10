module.exports = {
  start: () => `Hello! Please select type of your account!
https://telegra.ph/Route-Cab-English-11-10
  `,
  start2: () => `Hello! Please select type of your account!
  1. I am a driver (with car)
  2. I am a car sharing driver (without car)
  3. I am a passenger
  `,
  start3: () => 'Hello!',
  driver: () => `Create your first regular route
Send departure point`,
  support: links => {
    let s = 'For support:';
    s += `${links.length ? `\n${links.join('\n\n')}` : ''}`;
    return s;
  },
};
