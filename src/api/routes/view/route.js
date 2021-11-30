const messages = require('../../../messages/format');

const showAdmin = (pointA, pointB) => {
  const loc1 = `${pointA.coordinates[1]},${pointA.coordinates[0]}`;
  const loc2 = `${pointB.coordinates[1]},${pointB.coordinates[0]}`;
  return `
  https://routing.openstreetmap.de/?z=10&center=${loc1}&loc=${loc1}&loc=${loc2}&hl=en&alt=0&srv=1
  `;
};

function printRouteOne1(r, lang, isEdit = false, admin = false) {
  const {name, status, notify, pointA, pointB, hourA, hourB, type} = r;
  const statu = messages.showStatus(status, lang, messages.icon(status));
  const notif = messages.showStatus(notify, lang, messages.icon(notify));
  let txt = `
${messages.labelName(lang)}: ${name}
${messages.labelStatus(lang)}: ${statu}
${messages.labelSubs(lang)}: ${notif}                            ${
  isEdit ? messages.editSupLink(lang) : ''
}
${messages.labelType(lang)}: ${messages.getType(lang, type)}
`;
  if (!isEdit && pointA && pointB) {
    txt += `📍${messages.labelA(lang)}: \`\`\`${pointA.coordinates}\`\`\`
📍${messages.labelB(lang)}: \`\`\`${pointB.coordinates}\`\`\``;
  }
  if (typeof hourA !== 'undefined') {
    txt += `
${messages.labelTime(lang)}
${messages.labelTimeA(lang)}: ${messages.showHour(lang, hourA, true)}
${messages.labelTimeB(lang)}: ${messages.showHour(lang, hourB, true)}`;
  }
  if (admin && pointA && pointB) {
    txt += showAdmin(pointA, pointB);
  }
  return txt;
}

function printRouteFound1(routes, lang, type) {
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
    if (typeof hourA !== 'undefined') {
      txt += `
${messages.labelTime(lang)}
${messages.labelTimeA(lang)}: ${messages.showHour(lang, hourA)}
${messages.labelTimeB(lang)}: ${messages.showHour(lang, hourB)}`;
    }
  });
  return txt;
}

module.exports = {
  printRouteFound: printRouteFound1,
  printRouteOne: printRouteOne1,
};
