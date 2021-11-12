const fs = require('fs');
const db = require('../../utils/db');
const messages = require('../../../messages/format');
const keyboards = require('../../../keyboards/keyboards');

const TG_ADMIN = parseInt(process.env.TGADMIN, 10);
const OFF = 'Off';
const ON = 'On';
const INLINE_TITLE = 'InstantView created. Click me to send';

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
  }

  isAdmin(chatId) {
    return chatId === this.tgAdmin;
  }

  botMes(chatId, text, mark = true) {
    let opts = {};
    if (mark) {
      opts = {parse_mode: 'Markdown'};
    }
    return this.bot
      .sendMessage(chatId, text, opts)
      .catch(e => this.sendError(e, `${chatId}${text}`));
  }

  sendAdminOpts(text, opts) {
    const chatId = process.env.TGGROUPBUGS || TG_ADMIN;
    return this.bot.sendMessage(chatId, text, opts);
  }

  sendInline({title, messageId, ivLink}) {
    let inlineTitle = title;
    if (!title) {
      inlineTitle = INLINE_TITLE;
    }
    const queryResult = {
      type: 'article',
      id: messageId,
      title: inlineTitle,
      input_message_content: {message_text: ivLink},
    };

    return this.bot.answerInlineQuery(messageId, [queryResult]);
  }

  sendAdminMark(text, chatId) {
    return this.botHelper.sendAdmin(text, chatId, true);
  }

  getParams(hostname, chatId, force) {
    const params = {};
    const contentSelector =
      force === 'content' || this.getConf(`${hostname}_content`);
    if (contentSelector) {
      params.content = contentSelector;
    }
    const puppetOnly = force === 'puppet' || this.getConf(`${hostname}_puppet`);
    if (puppetOnly) {
      params.isPuppet = true;
    }
    const customOnly = force === 'custom' || this.getConf(`${hostname}_custom`);
    if (customOnly) {
      params.isCustom = true;
    }
    const wget = force === 'wget' || this.getConf(`${hostname}_wget`);
    if (wget) {
      params.isWget = true;
    }
    const cached = force === 'cached' || this.getConf(`${hostname}_cached`);
    if (cached) {
      params.isCached = true;
    }
    const scroll = this.getConf(`${hostname}_scroll`);
    if (scroll) {
      params.scroll = scroll;
    }
    const noLinks =
      force === 'no_links' || this.getConf(`${hostname}_no_links`);
    if (noLinks) {
      params.noLinks = true;
    }
    const pcache = force === 'p_cache';
    if (pcache) {
      params.isCached = true;
      params.cachefile = 'puppet.html';
      params.content = this.getConf('p_cache_content');
    }
    if (this.isAdmin(chatId)) {
      if (this.getConf('test_puppet')) {
        params.isPuppet = true;
      }
      if (this.getConf('test_custom')) {
        params.isCustom = true;
      }
    }
    return params;
  }

  getConf(param) {
    let c = this.config[param] || '';
    if (c === OFF) c = '';
    return c;
  }

  togglecConfig(msg) {
    const params = msg.text.replace('/cconfig', '').trim();
    if (!params || !this.isAdmin(msg.chat.id)) {
      return Promise.resolve('no param or forbidden');
    }
    const {param, content} = this.parseConfig(params);
    const c = {};
    c[param] = content;
    fs.writeFileSync(`.conf/custom/${param}.json`, JSON.stringify(c));
    return false;
  }

  parseConfig(params) {
    let content;
    let param;
    const c = params.replace(' _content', '_content').split(/\s/);
    if (c.length === 2) {
      [param] = c;
      content = c[1].replace(/~/g, ' ');
    } else {
      [param] = c;
      if (this.config[param] === ON) {
        content = OFF;
      } else {
        content = ON;
      }
    }
    return {param, content};
  }

  toggleConfig(msg) {
    const params = msg.text.replace('/config', '').trim();
    if (!params || !this.isAdmin(msg.chat.id)) {
      return Promise.resolve('no param or forbidden');
    }

    const {param, content} = this.parseConfig(params);
    this.config[param] = content;
    fs.writeFileSync('.conf/config.json', JSON.stringify(this.config));
    return this.botMes(TG_ADMIN, content, false);
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

  disDb() {
    this.db = false;
  }

  setBlacklist(f) {
    this.bllist = fs.readFileSync(f).toString() || '';
  }

  isBlackListed(h) {
    return this.bllist.match(h);
  }

  forward(mid, from, to) {
    return this.bot.forwardMessage(to, from, mid);
  }

  sendIV(chatId, messageId, inlineMessageId, messageText, extra) {
    return this.bot
      .editMessageText(chatId, messageId, inlineMessageId, messageText, extra)
      .catch(() => {});
  }

  // eslint-disable-next-line class-methods-use-this
  async nextProcess(ctx, isName = false, addRoute = false) {
    const {from} = ctx.message;
    const user = from;
    const {
      id,
      routes: userRoutes,
      name: userRouteName,
    } = await db.GetUser(user.id);
    let routes = addRoute ? undefined : userRoutes;
    if (addRoute) {
      routes = undefined;
      await db.clearName(user.id);
    }
    if (!userRouteName) {
      routes = undefined;
    }
    console.log('next routes ', routes);
    let keyb = keyboards.nextProcess();
    let txt = messages.whatNext();
    let routeType = 0;
    const edit = false;

    if (!routes) {
      txt = messages.driverNewRoute();
      if (isName) {
        const name = ctx.update.message.text;
        await db.addRoute(user.id, name);
        routeType = 1;
      }
    }
    if (routes === 1) {
      txt = messages.driverStartPoint();
      routeType = 2;
      if (isName) {
        const name = ctx.update.message.text;
        await db.addRoute(user.id, name);
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
      keyb.parse_mode = 'Markdown';
      keyb.disable_web_page_preview = true;
    }
    try {
      if (edit) {
        console.log('test 2');
        const messageId = ctx.message.message_id;
        this.bot
          .editMessageText(id, messageId, null, txt, keyb)
          .catch(() => {});
      } else {
        console.log('test 1');
        ctx.reply(txt, keyb);
      }
      // ctx.reply('test', keyboards.loc());
    } catch (e) {
      // system = `${e}${system}`;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async driverType(ctx, type) {
    const user = ctx.message.from;
    user.type = type;
    const {routes} = await db.updateUser(user);
    let system = '';
    try {
      const txt = messages.whatNext();
      const keyb = keyboards.driver(type, {routes});
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
  async processLocation(ctx) {
    const {update} = ctx;
    const {message} = update;
    const {location, chat} = message;
    if (location.latitude && location.longitude) {
      const {routes, type} = await db.GetUser(chat.id);
      const route = {
        userId: chat.id,
        location: {
          type: 'Point',
          coordinates: [location.latitude, location.longitude],
        },
        category: 'Routes',
        type,
        direction: 1,
        status: 0,
      };
      let txt = 'Completed';
      let keyb = keyboards.nextProcess(1);
      if (!routes) {
        txt = messages.driverNewRoute();
        keyb = keyboards.nextProcess();
        // await db.addRouteA({...route, name: 'A point', direction: 1});
      }
      if (routes === 1) {
        keyb = keyboards.nextProcess(1);
        await db.addRouteB({...route, name: 'B point', direction: 2});
      }
      if (routes === 2) {
        keyb = keyboards.nextProcess(2);
        await db.addRouteB({...route, name: 'B point', direction: 2});
      }
      ctx.reply(txt, keyb);
    }
  }
}

module.exports = BotHelper;
