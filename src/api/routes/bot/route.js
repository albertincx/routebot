const db = require('../../utils/db');
const messages = require('../../../messages/format');
const keyboards = require('../../../keyboards/keyboards');
const {checkAdmin} = require('../../utils');

const TG_ADMIN = parseInt(process.env.TGADMIN, 10);
function checkLoc(l) {
  const val = parseFloat(l);
  return !Number.isNaN(val) && val <= 90 && val >= -90;
}
function checkLocation(loc) {
  return checkLoc(loc[0]) && checkLoc(loc[1]);
}
class BotHelper {
  constructor(botHelper) {
    this.bot = botHelper.getBot();
    this.botHelper = botHelper;
    this.tgAdmin = TG_ADMIN;
    this.perPage = 6;
  }

  isAdmin(chatId) {
    return chatId === this.tgAdmin;
  }

  botMessage(chatId, text, opts) {
    return this.bot
      .sendMessage(chatId, text, opts)
      .catch(e => this.sendError(e, `${chatId}${text}`));
  }

  sendError(error, text = '') {
    let e = error;
    if (typeof e === 'object') {
      if (e.response && typeof e.response === 'object') {
        e = e.response.description || 'unknown error';
      }
    } else {
      e = `error: ${JSON.stringify(e)} ${e.toString()} ${text}`;
    }

    return this.botHelper.sendAdmin(e);
  }

  forward(mid, from, to) {
    return this.bot.forwardMessage(to, from, mid);
  }

  edit(chatId, messageId, inlineMessageId, messageText, extra) {
    return this.bot.editMessageText(
      chatId,
      messageId,
      inlineMessageId,
      messageText,
      extra,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  async addRoute(id) {
    await db.clearRoutes(id);
  }

  // eslint-disable-next-line class-methods-use-this
  async nextProcessName(ctx) {
    if (checkAdmin(ctx)) {
      return;
    }
    const {from} = ctx.message;
    const {id: userId, language_code: lang} = from;
    const keyb = keyboards.nextProcess(1, lang);
    const txt = messages.point(1, lang);
    const name = ctx.update.message.text;
    await db.addRoute({userId}, {name});
    try {
      ctx.reply(txt, keyb);
    } catch (e) {
      // system = `${e}${system}`;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async driverType(ctx, type) {
    if (checkAdmin(ctx)) {
      return;
    }
    const {from: f} = ctx.message;
    const from = f;
    const {language_code: lang} = from;
    const user = from;
    user.type = type;
    await db.updateUser(user);
    let system = '';
    try {
      const txt = messages.home(lang);
      const keyb = keyboards.driver(lang);
      ctx.reply(txt, keyb);
    } catch (e) {
      system = `${e}${system}`;
    }

    if (system) {
      this.botHelper.sendAdmin(system);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async getCounts(id) {
    const {total: totalRoutesCount} = await db.GetUser(id, 'total');
    let total = 0;
    if (totalRoutesCount) {
      total = await db.getActiveCnt(id);
    }
    return {total, count: totalRoutesCount};
  }

  // eslint-disable-next-line class-methods-use-this
  async driverTypeChange(chat, type) {
    const user = chat;
    user.type = parseInt(type, 10);
    const {routes, total: totalRoutesCount} = await db.updateUser(user);
    return {routes, count: totalRoutesCount};
  }

  // eslint-disable-next-line class-methods-use-this
  async goHome(from) {
    const {language_code: lang} = from;
    const txt = messages.home(lang);
    const keyb = keyboards.driver(lang);
    return {txt, keyb};
  }

  async goHomeCb(ctx) {
    const {from, message} = ctx.update.callback_query;
    const mid = message.message_id;
    let system = '';
    try {
      const {txt, keyb} = await this.goHome(from);
      this.edit(from.id, mid, null, txt, keyb);
    } catch (e) {
      system = `${e}${system}`;
    }

    if (system) {
      this.botHelper.sendAdmin(system);
    }
  }

  // eslint-disable-next-line class-methods-use-this,consistent-return
  async processLocation(ctx, locationFromTxt = []) {
    const {update} = ctx;
    const {message} = update;
    const {
      from: {language_code: lang},
    } = message;
    if (message.reply_to_message) {
      if (message.reply_to_message.text.match(messages.check(lang))) {
        // Send the name of your route

        return this.nextProcessName(ctx);
      }
      // eslint-disable-next-line consistent-return
      return;
    }
    const {location: msgLocation} = message;
    let location = [];
    if (locationFromTxt.length) {
      location = locationFromTxt;
    } else if (msgLocation) {
      location = [msgLocation.latitude, msgLocation.longitude];
    }
    if (location[0] && location[1]) {
      const {from} = message;
      const {id: userId} = from;
      const {routes, type} = await db.GetUser(userId, 'routes type');
      if (!checkLocation(location)) {
        const txt = messages.point(routes, lang);
        const keyb = keyboards.nextProcess(routes, lang);
        ctx.reply(txt, keyb);
        // eslint-disable-next-line consistent-return
        return;
      }
      const loc = {
        type: 'Point',
        coordinates: location,
      };
      const routeData = {
        userId,
        category: 'Routes',
        type,
        status: 0,
      };
      let txt = messages.success(lang);
      let keyb = keyboards.nextProcess(1, lang);
      if (!routes) {
        txt = messages.driverStartNewRoute(lang);
        keyb = keyboards.fr();
      }
      if (routes === 1) {
        keyb = keyboards.nextProcess(2, lang);
        txt = messages.point(2, lang);
        await db.addRouteA(routeData, loc);
      }
      if (routes === 2) {
        keyb = keyboards.hide();
        await db.addRouteB(routeData, loc);
        await db.updateOne(userId);
      }
      await ctx.reply(txt, keyb);
      if (routes === 2) {
        keyb = keyboards.driver(lang);
        this.botMessage(userId, messages.home(lang), keyb);
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  stopAll(id) {
    return db.stopAll(id);
  }

  // eslint-disable-next-line class-methods-use-this
  getRoute(id, _id) {
    return db.getRoute(id, _id);
  }

  async myRoutes(id, page = 1) {
    const cnt = await db.routesCnt(id);
    let r = await db.getRoutes(id, page, this.perPage);
    r = r.map(i => i.toObject());
    return {cnt, routes: r};
  }

  // eslint-disable-next-line class-methods-use-this
  async findRoutes(id, page = 1, _id = '') {
    const route = await db.getRoute(id, _id);
    let cnt = 0;
    let r = [];
    if (route) {
      const [aggr] = await db.getRoutes(route, page, 1, true);
      if (aggr) {
        const {data, metadata = []} = aggr;
        r = data;
        cnt = (metadata[0] && metadata[0].total) || 0;
      }
    }

    return {cnt, routes: r};
  }

  // eslint-disable-next-line class-methods-use-this
  async setStatusRoute(chatId, _id, st) {
    const status = st === 'activate' ? 1 : 0;
    await db.statusRoute(chatId, _id, {status});
    const r = await db.getRoute(chatId, _id);
    if (r) {
      return {routes: [r]};
    }
    return {routes: []};
  }

  // eslint-disable-next-line class-methods-use-this
  checkUser(id) {
    return db.checkUser(id);
  }
}

module.exports = BotHelper;
