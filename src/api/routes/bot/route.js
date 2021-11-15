const db = require('../../utils/db');
const messages = require('../../../messages/format');
const keyboards = require('../../../keyboards/keyboards');
const {checkAdmin} = require('../../utils');

const TG_ADMIN = parseInt(process.env.TGADMIN, 10);

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
  async addRoute(ctx) {
    const msg = ctx.update.callback_query;
    const {from} = msg;
    await db.clearRoutes(from.id);
    const keyb = keyboards.fr();
    const txt = messages.driverNewRoute();
    try {
      ctx.reply(txt, keyb);
    } catch (e) {
      // system = `${e}${system}`;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async nextProcessName(ctx) {
    if (checkAdmin(ctx)) {
      return;
    }
    const {from} = ctx.message;
    const user = from;
    const keyb = keyboards.nextProcess(1);
    const txt = messages.driverStartPoint();
    const name = ctx.update.message.text;
    await db.addRoute({userId: user.id}, {name});
    try {
      ctx.reply(txt, keyb);
    } catch (e) {
      // system = `${e}${system}`;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async nextProcess(ctx) {
    if (checkAdmin(ctx)) {
      return;
    }
    const {from} = ctx.message;
    const {routes: ur, name: userRouteName} = await db.GetUser(
      from.id,
      'routes name',
    );
    let routes = ur;
    if (!userRouteName) {
      routes = undefined;
    }
    let keyb = keyboards.nextProcess();
    let txt = messages.whatNext();
    let routeType = 0;
    if (!routes) {
      txt = messages.driverNewRoute();
    }
    if (routes === 1) {
      txt = messages.driverStartPoint();
      routeType = 2;
    }
    if (routes === 2) {
      txt = messages.driverLastPoint();
      routeType = 3;
    }
    if (!routes || routes < 3) {
      keyb = keyboards.nextProcess(routeType);
      if (!routes) {
        keyb = keyboards.fr();
      }
    }
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
    let user;
    if (ctx.update && ctx.update.callback_query) {
      const msg = ctx.update.callback_query;
      const {from} = msg;
      user = from;
    } else {
      user = ctx.message.from;
    }
    user.type = type;
    const {routes, total: totalRoutesCount} = await db.updateUser(user);
    let total = 0;
    if (routes === 3 && totalRoutesCount) {
      total = await db.getActiveCnt(user.id);
    }
    let system = '';
    try {
      const txt = messages.whatNext();
      const keyb = keyboards.driver(routes, total);
      ctx.reply(txt, keyb);
    } catch (e) {
      system = `${e}${system}`;
    }

    if (system) {
      this.botHelper.sendAdmin(system);
    }
  }

  async goHome(ctx) {
    const {from, message} = ctx.update.callback_query;
    const user = from;
    const mid = message.message_id;
    const {routes: r, total: ttlCnt} = await db.GetUser(
      user.id,
      'routes total',
    );
    const routes = r;
    const totalRoutesCount = ttlCnt;

    let total = 0;
    if (routes === 3 && totalRoutesCount) {
      total = await db.getActiveCnt(user.id);
    }
    let system = '';
    try {
      const txt = messages.whatNext();
      const keyb = keyboards.driver(routes, total);
      this.edit(user.id, mid, null, txt, keyb);
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
    if (message.reply_to_message) {
      if (message.reply_to_message.text.match(messages.check)) {
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
      const {chat} = message;
      const {id: userId} = chat;
      const {routes, type} = await db.GetUser(userId);
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
      let txt = 'Completed';
      let keyb = keyboards.nextProcess(1);
      if (!routes) {
        txt = messages.driverNewRoute();
        keyb = keyboards.fr();
      }
      if (routes === 1) {
        keyb = keyboards.nextProcess(2);
        txt = messages.driverLastPoint();
        await db.addRouteA(routeData, loc);
      }
      if (routes === 2) {
        const total = await db.getActiveCnt(userId);
        keyb = keyboards.driver(3, total);
        await db.addRouteB(routeData, loc);
        await db.updateOne(userId);
      }
      ctx.reply(txt, keyb);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  stopAll(ctx) {
    const msg = ctx.update.callback_query;
    const {from} = msg;
    db.stopAll(from.id).then(() => {
      const keyb = keyboards.driver(3, 0);
      ctx.reply(messages.stoppedAll(), keyb);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async myRoutes(id, page = 1, _id = '') {
    const cnt = await db.routesCnt(id);
    let r;
    if (_id) {
      r = await db.getRoute(id, _id);
      if (r) {
        r = [r];
      }
    } else {
      r = await db.getRoutes(id, page, this.perPage);
      r = r.map(i => i.toObject());
    }
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
