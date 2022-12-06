const messages = require('../../../messages/format');

function printRouteOne1(r, lang, isEdit = false) {
  const {name, status, notify, pointA, pointB, hourA, hourB, type, _id} = r;
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
  if (pointA && pointB) {
    txt += `

[Show route on Route.cab](https://web.route.cab/#/show/${_id}) 
  `;
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
