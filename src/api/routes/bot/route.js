const db = require('../../utils/db');
const messages = require('../../../messages/format');
const keyboards = require('../../../keyboards/keyboards');
const {checkAdmin, showError, matchEscapeRegex} = require('../../utils');
const rabbitmq = require('../../../service/rabbitmq');

const TG_ADMIN = parseInt(process.env.TGADMIN, 10);
const TG_ADMIN2 = parseInt(process.env.TGADMIN2, 10);
const cBroad = '/createBroadcast';
const sBroad = '/startBroadcast';

function checkLocLong(l) {
  const val = parseFloat(l);
  return !Number.isNaN(val) && val <= 180 && val >= -180;
}
function checkLocLat(l) {
  const val = parseFloat(l);
  return !Number.isNaN(val) && val <= 90 && val >= -90;
}
function checkLocation(loc) {
  return checkLocLong(loc[0]) && checkLocLat(loc[1]);
}

class BotHelper {
  constructor(botHelper) {
    this.bot = botHelper && botHelper.getBot();
    this.botHelper = botHelper;
    this.tgAdmin = TG_ADMIN;
    this.tgAdmin2 = TG_ADMIN2;
    this.perPage = 6;
    this.admPerPage = 30;
  }

  isAdmin(chatId) {
    return chatId === this.tgAdmin;
  }

  botMessage(chatId, text, opts) {
    return this.bot.sendMessage(chatId, text, opts);
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

    return this.botHelper.sendAdmin(e, '', text);
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
  async addSubscription(d) {
    await db.addSubscription(d);
  }

  // eslint-disable-next-line class-methods-use-this
  async nextProcessName(ctx) {
    const {from} = ctx.message;
    const {id: userId, language_code: lang} = from;
    const name = ctx.update.message.text;

    const exists = await db.getRoute({userId, name});
    let txt;
    let keyb;
    if (!exists) {
      keyb = keyboards.nextProcess(1, lang);
      txt = messages.point(1, lang);
      await db.addRoute({userId}, {name});
    } else {
      const txt1 = messages.routeExists(lang);
      await ctx.reply(txt1);
      txt = messages.driverStartNewRoute(lang);
      keyb = keyboards.fr();
    }
    try {
      ctx.reply(txt, keyb);
    } catch (e) {
      this.sendError(e, 'nextProcessName');
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async setUsername(from) {
    await db.updateUser(from);
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
      const {txt, keyb} = this.goMenu(lang, type);
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
    await db.updateRoutes(user);
    return {routes, count: totalRoutesCount};
  }

  // eslint-disable-next-line class-methods-use-this
  async goHome(from) {
    const {id, language_code: lang} = from;
    const {type} = await db.GetUser(id, 'type');
    const adm = this.isAdmin(id);
    return this.goMenu(lang, type, adm);
  }

  // eslint-disable-next-line class-methods-use-this
  noUserName(id, lang) {
    const txt = messages.noUserNameTxt(lang);
    const keys = [];
    keys.push([
      {
        text: messages.isUName(lang),
        callback_data: keyboards.actions.iSetUName,
      },
    ]);
    const keyb = keyboards.withHome(lang, keys);
    return {txt, keyb};
  }

  // eslint-disable-next-line class-methods-use-this
  async goHomeAction(ctx, from, cbqId) {
    const {id, language_code: lang} = from;
    const {type} = await db.GetUser(id, 'type');
    const {txt, keyb} = this.goMenu(lang, type);
    ctx.reply(txt, keyb);
    ctx.answerCbQuery(cbqId, {text: ''});
  }

  // eslint-disable-next-line class-methods-use-this
  goMenu(lang, type, adm) {
    const txt = messages.home(lang, type);
    const keyb = keyboards.driver(lang, type, adm);
    return {txt, keyb};
  }

  // eslint-disable-next-line class-methods-use-this,consistent-return
  async processLocation(ctx, coordinatesTxtArr = []) {
    const {update} = ctx;
    const {message} = update;
    const {from, reply_to_message: rpl, location: msgLocation} = message;
    const {language_code: lang} = from;

    let location = [];
    if (coordinatesTxtArr.length) {
      location = coordinatesTxtArr;
    } else if (msgLocation) {
      location = [msgLocation.latitude, msgLocation.longitude];
    }

    if (rpl) {
      if (msgLocation) {
        if (!rpl.text) {
          ctx.reply(messages.driverStartNewRoute(lang), keyboards.fr());
          return;
        }
        const s =
          matchEscapeRegex(messages.point(1, lang), rpl.text) ||
          matchEscapeRegex(messages.point(2, lang), rpl.text);
        if (s) {
          // eslint-disable-next-line consistent-return
          return this.nextProcessLocation(ctx, location);
        }
      }
      if (rpl.text.match(messages.check(lang))) {
        // Send the name of your route
        // eslint-disable-next-line consistent-return
        return this.nextProcessName(ctx);
      }
      // eslint-disable-next-line consistent-return
      return;
    }
    // eslint-disable-next-line consistent-return
    return this.nextProcessLocation(ctx, location);
  }

  async nextProcessLocation(ctx, location) {
    const {update} = ctx;
    const {message} = update;
    const {from} = message;
    const {language_code: lang} = from;
    if (location[0] && location[1]) {
      if (!checkLocation(location)) {
        // eslint-disable-next-line no-throw-literal
        throw 'bounds';
      }
      const {id: userId} = from;
      const {routes, type, name} = await db.GetUser(userId, 'routes type name');
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
        await db.addRouteAFirst(routeData, loc, name);
      }
      let lastUpdatedId = '';
      if (routes === 2) {
        keyb = keyboards.hide();
        const {routes: notifyRoutes, lastUpdatedId: lId} = await db.addRouteB(
          routeData,
          loc,
          name,
        );
        lastUpdatedId = lId;
        if (Array.isArray(notifyRoutes) && notifyRoutes.length) {
          this.notifyUsers(notifyRoutes, lang);
        }
        await db.updateOne(userId);
      }
      if (txt === messages.success(lang)) {
        keyb = keyboards.hide();
      }
      await ctx.reply(txt, keyb);
      if (routes === 2) {
        txt = messages.editTime(lang);
        const cbPath = `t_fromB_${lastUpdatedId}_1`;
        const keys = keyboards.editTime(lang, false, cbPath);
        keyb = keyboards.withHome(lang, [...keys]);
        this.botMessage(userId, txt, keyb);
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  stopAll(id) {
    return db.stopAll(id);
  }

  // eslint-disable-next-line class-methods-use-this
  getRoute(f) {
    return db.getRoute(f);
  }

  // eslint-disable-next-line class-methods-use-this
  getRequest(reqData, n) {
    return db.getRequest(reqData, n);
  }

  // eslint-disable-next-line class-methods-use-this
  getRouteById(_id, project) {
    return db.getRoute({_id}, project);
  }

  async myRoutes(id, page = 1, adm = false) {
    let filter = {userId: id};
    let {perPage} = this;
    if (adm) {
      filter = {status: 1};
      perPage = this.admPerPage;
    }
    const cnt = await db.routesCnt(filter);
    let r = await db.getRoutes(filter, page, perPage);
    r = r.map(i => i.toObject());
    return {cnt, routes: r};
  }

  // eslint-disable-next-line class-methods-use-this
  async findRoutes(id, page, _id, type) {
    const route = await db.getRoute(
      {userId: id, _id},
      'userId pointA pointB hourA hourB distA distB',
    );
    let cnt = 0;
    let r = [];
    if (route) {
      const {cnt: cc, routes: rr} = await db.getRoutesNear(route, page, type);
      if (cc) {
        cnt = cc;
        r = rr;
      }
    }

    return {cnt, routes: r};
  }

  // eslint-disable-next-line class-methods-use-this
  async setFieldRoute(userId, _id, st, field) {
    const upd = {[field]: st};
    if (field === 'status') {
      upd.notify = st;
    }
    await db.statusRoute(userId, _id, upd);
  }

  // eslint-disable-next-line class-methods-use-this
  async setFieldsRoute(userId, _id, upd) {
    if (typeof upd.status !== 'undefined') {
      // eslint-disable-next-line no-param-reassign
      upd.notify = upd.status;
    }
    await db.statusRoute(userId, _id, upd);
  }

  // eslint-disable-next-line class-methods-use-this,consistent-return
  async setStatusRoute(userId, _id, st) {
    let set = true;
    const error = {};
    const r = await db.getRoute({userId, _id});
    if (Number.isNaN(r.hourA)) {
      error.error = 'set Hour A';
      error.field = 'hourA';
      set = false;
    }
    if (!r.hourB) {
      error.error = 'set Hour B';
      error.field = 'hourB';
      set = false;
    }
    if (set) {
      await this.setFieldRoute(userId, _id, st, 'status');
      r.status = st;
    }
    if (error.error) {
      return error;
    }
    if (r) {
      return r;
    }
  }

  async notifyUsers(routes) {
    // eslint-disable-next-line no-restricted-syntax
    for (const r of routes) {
      const {name, userId: id} = r;
      try {
        // eslint-disable-next-line no-await-in-loop
        const user = await db.GetUser(id, 'language_code');
        const {language_code: lang} = user;
        const notifyUserTxt = messages.notifyUser(lang, name);
        this.botMessage(id, notifyUserTxt);
      } catch (e) {
        this.sendError(e);
        showError(e);
      }
    }
  }

  broadcast(ctx) {
    const {
      from: {id},
      text,
    } = ctx.message;
    if (!this.botHelper.isAdmin(id) || !text) {
      //
    } else {
      let txt = text;
      if (txt.match(cBroad)) {
        ctx.reply('broad new started');
        return db.createBroadcast(ctx, txt);
      }
      if (txt.match(sBroad)) {
        txt = txt.replace(sBroad, '');
        ctx.reply('broad send started');
        return db.startBroadcast(ctx, txt, this.botHelper);
      }
    }
    return Promise.resolve();
  }

  // eslint-disable-next-line class-methods-use-this
  deleteRoute(id) {
    return db.deleteRoute(id);
  }

  // eslint-disable-next-line class-methods-use-this
  notifyUsersDelCb(items) {
    items.forEach(u => {
      rabbitmq.addToQueue({...u, delete: 1});
    });
  }

  notifyUsersDel(_id) {
    return db.subscribers(_id, this.notifyUsersDelCb);
  }

  // eslint-disable-next-line class-methods-use-this
  async jobMessage(task) {
    console.log('from rab', task);
  }

  async clearReq(ctx) {
    try {
      const [, collId] = ctx.message.text.split('/clearreq_');
      await db.deleteMany({from: {$in: [this.tgAdmin, this.tgAdmin2]}}, collId);
      ctx.reply('ok');
    } catch (e) {
      ctx.reply(e);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async cconfig(ctx) {
    try {
      const [, PA, VA] = ctx.message.text.split(/\/cconfig (.*?)=(.*?)$/);
      if (PA) {
        if (typeof globalSUPPLINKS !== 'undefined') {
          // eslint-disable-next-line no-undef
          globalSUPPLINKS[PA] = VA;
          // eslint-disable-next-line no-undef
          await db.updateConfig(globalSUPPLINKS);
        }
      }
      ctx.reply(`ok ${PA}`);
    } catch (e) {
      ctx.reply(e);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async GetUserName(id) {
    const u = await db.GetUser(id, 'username');
    return u && u.username;
  }

  // eslint-disable-next-line class-methods-use-this
  async GetLangUser(id) {
    const u = await db.GetUser(id, 'language_code');
    return u && u.language_code;
  }

  getPpage(adm) {
    return adm ? this.admPerPage : this.perPage;
  }

  // eslint-disable-next-line class-methods-use-this
  setDist(_id, d) {
    return db.setField({_id}, 'dist', d);
  }
}

module.exports = BotHelper;
