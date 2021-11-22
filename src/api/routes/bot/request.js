const messages = require('../../../messages/format');
const keyboards = require('../../../keyboards/keyboards');
const {actions} = require('../../../keyboards/keyboards');

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
  if (sendR === keyboards.actions.allowReq1) {
    const req = await BH2.getRequest(reqData, isNotify);
    if (req) {
      return messages.sentAlready(lang, isNotify);
    }
  }
  if (isNotify) {
    await BH2.addSubscription(reqData);
    // text = messages.sentNotify(lang);
    text = 'soon...';
  } else {
    const route = await BH2.getRouteById(_id, 'name');
    if (route) {
      const {name} = route;
      let txt;
      let keyb;
      const keys = [];
      if (sendR.match(keyboards.actions.sendDriverReq)) {
        txt = messages.notifyUserDriver(lang, name);
        text = messages.sentR(lang);
        keyb = keyboards.withHome(lang, keys, false);
        keys.push({
          text: messages.allowReq(lang),
          callback_data: `req_${_id}_${requestUserId}_${actions.allowReq1}_${userId}`,
        });
      }
      if (sendR.match(keyboards.actions.sendPassReq)) {
        txt = messages.notifyUserCoop(lang, name);
        text = messages.sent3R(lang);
      }
      if (txt) {
        keyb = keyboards.withHome(lang, keys, false);
        BH2.botMessage(userId, txt, keyb);
      }
    }
  }
  return text;
}

module.exports.processSendR = processSendR;
