const messages = require('../../../messages/format');

function printRouteOne(r, lang, showPoints = true) {
  if (!r) {
    return messages.routesEmpty(lang);
  }
  const {name, status, notify, pointA, pointB, hourA, hourB} = r;
  const statu = messages.showStatus(status, lang, messages.icon(status));
  const notif = messages.showStatus(notify, lang, messages.icon(notify), 'а');
  let txt = `
${messages.labelName(lang)}: ${name}
${messages.labelStatus(lang)}: ${statu}
${messages.labelSubs(lang)}: ${notif}

`;
  if (showPoints) {
    txt += `📍${messages.labelA(lang)}: \`\`\`${pointA.coordinates}\`\`\`
📍${messages.labelB(lang)}: \`\`\`${pointB.coordinates}\`\`\``;
  }
  if (hourA) {
    txt += `
${messages.labelTime(lang)}
${messages.labelTimeA(lang)}: ${messages.showHour(lang, hourA)}
${messages.labelTimeB(lang)}: ${messages.showHour(lang, hourB)}`;
  }
  return txt;
}

function printRouteFound(routes, lang, type) {
  let txt = '';
  if (routes.length === 0) {
    return messages.routesEmpty(lang);
  }
  routes.forEach(r => {
    let tt = '';
    if (type === 0) {
      tt = `${messages.labelType(lang)}: ${messages.getType(lang, r.type)}`;
    }
    txt += `${tt}
${messages.labelName(lang)}: ${r.name}
`;
  });
  return txt;
}

module.exports = {
  printRouteFound: printRouteFound,
  printRouteOne: printRouteOne,
};
