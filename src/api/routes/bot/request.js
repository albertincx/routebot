const messages = require('../../../messages/format');
const keyboards = require('../../../keyboards/keyboards');

async function processSendR(ctx, from, BH2) {
  const {language_code: lang} = from;
  const [data] = ctx.match;
  const [, _id, requestUserId, sendR, userId] = data.match(
    /req_(.*?)_([0-9]+)_(.*?)_([0-9]+)$/,
  );
  let text = 'error';
  const reqData = {from: +requestUserId, to: +userId, routeId: _id};
  const isNotify = sendR === keyboards.actions.sendNotify;
  if (
    sendR === keyboards.actions.sendDriverReq ||
    sendR === keyboards.actions.sendPassReq ||
    isNotify
  ) {
    const req = await BH2.getRequest(reqData, isNotify);
    if (req) {
      return messages.sentAlready(lang, isNotify);
    }
  }
  if (isNotify) {
    await BH2.addSubscription(reqData);
    text = messages.sentNotify(lang);
  } else {
    const route = await BH2.getRouteById(_id, 'name');
    if (route) {
      const {name} = route;
      let txt;
      if (sendR.match(keyboards.actions.sendDriverReq)) {
        txt = messages.notifyUserDriver(lang, name);
        text = messages.sentR(lang);
      }
      if (sendR.match(keyboards.actions.sendPassReq)) {
        txt = messages.notifyUserCoop(lang, name);
        text = messages.sent3R(lang);
      }
      if (txt) {
        BH2.botMessage(userId, txt);
      }
    }
  }
  return text;
}

module.exports.processSendR = processSendR;
