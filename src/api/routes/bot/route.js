const fs = require('fs');
const db = require('../../utils/db');
const messages = require('../../../messages/format');
const keyboards = require('../../../keyboards/keyboards');
const {checkAdmin} = require('../../utils');

const TG_ADMIN = parseInt(process.env.TGADMIN, 10);

class BotHelper {
  constructor(botHelper) {
    this.bot = botHelper.getBot();
    this.botHelper = botHelper;
    let c = {no_puppet: false};
    try {
      c = JSON.parse(`${fs.readFileSync('.conf/config.json')}`);
    } catch (e) {
      //
    }
    this.config = c;
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
  async nextProcess(ctx, isName = false, addRoute = false) {
    if (checkAdmin(ctx)) {
      return;
    }
    const {from} = ctx.message;
    const user = from;
    const {id, routes: ur, name: userRouteName} = await db.GetUser(user.id);
    let routes = addRoute ? undefined : ur;
    if (addRoute) {
      routes = undefined;
      await db.clearRoutes(user.id);
    }
    if (!userRouteName && !isName) {
      routes = undefined;
    }
    let keyb = keyboards.nextProcess();
    let txt = messages.whatNext();
    let routeType = 0;
    const edit = false;

    if (!routes) {
      txt = messages.driverNewRoute();
      if (isName) {
        const name = ctx.update.message.text;
        await db.addRoute({userId: user.id}, {name});
        routeType = 1;
        routes = 1;
      }
    }
    if (routes === 1 || (routes === 3 && isName)) {
      txt = messages.driverStartPoint();
      routeType = 2;
      if (isName) {
        const name = ctx.update.message.text;
        await db.addRoute({userId: user.id}, {name});
      }
      // edit = true;
    }
    if (routes === 2) {
      txt = messages.driverLastPoint();
      routeType = 3;
      // edit = true;
    }
    if (!routes || routes < 3) {
      keyb = keyboards.nextProcess(routeType);
      if (!routes) {
        keyb = keyboards.fr();
      }
      keyb.parse_mode = 'Markdown';
      keyb.disable_web_page_preview = true;
    }
    if (routes === 3 && isName) {
      keyb.parse_mode = 'Markdown';
      keyb.disable_web_page_preview = true;
    }
    try {
      if (edit) {
        const messageId = ctx.message.message_id;
        this.bot
          .editMessageText(id, messageId, null, txt, keyb)
          .catch(() => {});
      } else {
        ctx.reply(txt, keyb);
      }
      // ctx.reply('test', keyboards.loc());
    } catch (e) {
      // system = `${e}${system}`;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async driverType(ctx, type) {
    if (checkAdmin(ctx)) {
      return;
    }
    const user = ctx.message.from;
    user.type = type;
    const {routes, total: ttlCnt} = await db.updateUser(user);
    let total = 0;
    if (routes === 3 && ttlCnt) {
      total = await db.getActiveCnt(user.id);
    }
    let system = '';
    try {
      const txt = messages.whatNext();
      const keyb = keyboards.driver(routes, total);
      // txt = messages.driverNewRoute(type);
      // keyb = keyboards.fr();
      // keyb.parse_mode = 'Markdown';
      // keyb.disable_web_page_preview = true;
      ctx.reply(txt, keyb);
    } catch (e) {
      system = `${e}${system}`;
    }

    if (system) {
      this.botHelper.sendAdmin(system);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async processLocation(ctx, isFromText = false) {
    const {update} = ctx;
    const {message} = update;
    if (message.reply_to_message) {
      if (message.reply_to_message.text.match(messages.check)) {
        // Send the name of your route
        this.nextProcess(ctx, true);
        return;
      }
      return;
    }
    const {location: msgLocation, text} = message;
    let location = [];
    if (isFromText) {
      location = text.split(',').map(Number);
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
        keyb = keyboards.nextProcess();
      }
      if (routes === 1) {
        keyb = keyboards.nextProcess(2);
        txt = messages.driverLastPoint();
        await db.addRouteA(routeData, loc);
        keyb.parse_mode = 'Markdown';
        keyb.disable_web_page_preview = true;
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
    if (checkAdmin(ctx)) {
      return;
    }
    const user = ctx.message.from;
    db.stopAll(user.id).then(() => {
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
  async setStatusRoute(chatId, _id, st) {
    const status = st === 'activate' ? 1 : 0;
    await db.statusRoute(chatId, _id, {status});
    const r = await db.getRoute(chatId, _id);
    if (r) {
      return {routes: [r]};
    }
    return {routes: []};
  }
}

module.exports = BotHelper;
