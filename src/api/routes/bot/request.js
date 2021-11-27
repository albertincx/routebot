const messages = require('../../../messages/format');
const keyboards = require('../../../keyboards/keyboards');

async function processSendR(ctx, BH2) {
  const msg = ctx.update.callback_query;
  const {from, message} = msg;
  const {message_id: mId} = message;
  const {id, language_code: lang} = from;
  const [data] = ctx.match;
  const [, _id, sendR, userId] = data.match(/req_(.*?)_(.*?)_([0-9]+)$/);
  let text = 'error';
  const reqData = {from: id, to: +userId, routeId: _id};
  const isNotify = sendR === keyboards.actions.sendNotify;
  if (
    sendR === keyboards.actions.sendDriverReq ||
    sendR === keyboards.actions.sendPassReq ||
    isNotify
  ) {
    if (isNotify) {
      return 'soon...';
    }
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
    const route = await BH2.getRouteById(_id, 'name notify');
    if (route) {
      const {name, notify} = route;
      if (notify !== 1) {
        return 'soon... soon...';
      }
      let txt;
      let keyb;
      const keys = [];
      if (sendR.match(keyboards.actions.sendDriverReq)) {
        const usernameFrom = await BH2.GetUserName(id);
        if (!usernameFrom) {
          try {
            const {txt: t, keyb: k} = BH2.noUserName(id, lang);
            BH2.edit(id, mId, null, t, k);
          } catch (e) {
            BH2.sendError(e);
            return 'error';
          }
          return '';
        }
        const languageTo = await BH2.GetLangUser(userId);
        txt = messages.notifyUserDriver(languageTo, name, usernameFrom);
        text = messages.sentR(lang);
      }
      if (sendR.match(keyboards.actions.sendPassReq)) {
        const usernameFrom = await BH2.GetUserName(id);
        if (!usernameFrom) {
          try {
            const {txt: t, keyb: k} = BH2.noUserName(id, lang);
            BH2.edit(id, mId, null, t, k);
          } catch (e) {
            BH2.sendError(e);
            return 'error';
          }
          return '';
        }
        const languageTo = await BH2.GetLangUser(userId);
        txt = messages.notifyUserCoop(languageTo, name, usernameFrom);
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
