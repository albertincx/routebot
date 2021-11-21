const messages = require('../../../messages/format');

function printRouteOne(r, lang, showPoints = true) {
  const {name, status, notify, pointA, pointB, hourA, hourB, type} = r;
  const statu = messages.showStatus(status, lang, messages.icon(status));
  const notif = messages.showStatus(notify, lang, messages.icon(notify));
  let txt = `
${messages.labelName(lang)}: ${name}
${messages.labelStatus(lang)}: ${statu}
${messages.labelSubs(lang)}: ${notif}
${messages.labelType(lang, true)}: ${messages.getType(lang, type)}

`;
  if (showPoints) {
    txt += `📍${messages.labelA(lang)}: \`\`\`${pointA.coordinates}\`\`\`
📍${messages.labelB(lang)}: \`\`\`${pointB.coordinates}\`\`\``;
  }
  if (hourA) {
    txt += `
${messages.labelTime(lang)}
${messages.labelTimeA(lang)}: ${messages.showHour(lang, hourA, true)}
${messages.labelTimeB(lang)}: ${messages.showHour(lang, hourB, true)}`;
  }
  return txt;
}

function printRouteFound(routes, lang, type) {
  let txt = '';
  if (routes.length === 0) {
    return messages.routesEmpty(lang, type === 0);
  }
  routes.forEach(r => {
    let tt = '';
    const {name, type: rType, hourA, hourB} = r;
    if (type === 0) {
      tt = `${messages.labelType(lang)}: ${messages.getType(lang, rType)}`;
    }
    txt += `${tt}
${messages.labelName(lang)}: ${name}
`;
    if (hourA) {
      txt += `
${messages.labelTime(lang)}
${messages.labelTimeA(lang)}: ${messages.showHour(lang, hourA)}
${messages.labelTimeB(lang)}: ${messages.showHour(lang, hourB)}`;
    }
  });
  return txt;
}

module.exports = {
  printRouteFound: printRouteFound,
  printRouteOne: printRouteOne,
};
