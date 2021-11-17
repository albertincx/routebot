const _ = require('lodash');

const keyboards = require('../../keyboards/keyboards');
const messages = require('../../messages/format');
const BUTTONS = require('../../config/buttons');
const db = require('../utils/db');
const {checkAdmin} = require('../utils');

const rabbitmq = require('../../service/rabbitmq');
const BotHelper2 = require('./bot/route');

rabbitmq.startChannel();
global.lastIvTime = +new Date();

/**
 * @param ctx
 * @param botHelper BotHelper
 */
const broadcast = (ctx, botHelper) => {
  const {
    from: {id},
    text,
  } = ctx.message;
  if (!botHelper.isAdmin(id) || !text) {
    return;
  }

  db.processBroadcast(text, ctx, botHelper);
};

function getPage(i, fromRoute = '') {
  if (fromRoute) {
    return `find_${i}_${fromRoute}`;
  }
  return `page_${i}`;
}

function getPagination(current, total, routs, fromRoute) {
  const keys = [];
  if (current > 1 && current <= 2) {
    keys.push({text: '«', callback_data: getPage(1, fromRoute)});
  }
  if (current > 2) {
    keys.push({
      text: '«',
      callback_data: getPage(current - 1, fromRoute),
    });
  }
  if (current < total - 1) {
    keys.push({
      text: '»',
      callback_data: getPage(current + 1, fromRoute),
    });
  }
  if (current < total && current >= total - 1) {
    keys.push({text: '»', callback_data: getPage(total, fromRoute)});
  }
  if (keys.length) {
    return [...routs, keys];
  }
  return [...routs];
}

function printRouteOne(routes, lang) {
  let txt = '';
  if (routes.length === 0) {
    return messages.routesEmpty(lang);
  }
  routes.forEach(r => {
    const status = messages.status(r.status, lang, messages.icon(r.status));
    txt += `
Route name: ${r.name}
Status: ${status}
`;
  });
  return txt;
}
function printRouteFound(routes, lang) {
  let txt = '';
  if (routes.length === 0) {
    return messages.routesEmpty(lang);
  }
  routes.forEach(r => {
    const status = messages.status(r.status, lang, messages.icon(r.status));
    txt += `
Route name: ${r.name}
Status: ${status}
`;
  });
  return txt;
}
function getTotalPages(cnt, perPage) {
  return cnt <= perPage ? 1 : Math.ceil(cnt / perPage);
}
function getPagi(cnt, perPage, routes, pageNum = 1, fromRoute = '') {
  const routs1 = routes.map(r => ({
    text: `${messages.icon(r.status)} ${r.name}`,
    callback_data: `route_${r._id}_${pageNum}`,
  }));
  const routs = _.chunk(routs1, 3);
  const pages = getTotalPages(cnt, perPage);
  return getPagination(pageNum, pages, routs, fromRoute);
}

const format = (bot, botHelper) => {
  const BH2 = new BotHelper2(botHelper);
  bot.command(['/createBroadcast', '/startBroadcast'], ctx =>
    broadcast(ctx, botHelper),
  );
  bot.hears(/([0-9.]+),[\s+]?([0-9.]+)/, ctx => {
    if (checkAdmin(ctx)) {
      return;
    }
    BH2.processLocation(ctx, [ctx.match[1], ctx.match[2]].map(Number));
  });
  bot.command(BUTTONS.driver.command, ctx => BH2.driverType(ctx, 1));
  bot.command(BUTTONS.sharingDriver.command, ctx => BH2.driverType(ctx, 2));
  bot.command(BUTTONS.passenger.command, ctx => BH2.driverType(ctx, 3));
  bot.command('/home', async ctx => {
    const {txt, keyb} = await BH2.goHome(ctx.message.from);
    ctx.reply(txt, keyb);
  });

  bot.action(/.*/, async ctx => {
    if (checkAdmin(ctx)) {
      return;
    }
    const msg = ctx.update.callback_query;
    const {from, message} = msg;
    const {message_id: mId} = message;
    const {id: cbqId} = msg;
    const [data] = ctx.match;
    /** @alias startHome */
    if (data.match(keyboards.actions.startHome)) {
      // eslint-disable-next-line consistent-return
      return BH2.goHomeCb(ctx);
    }
    /** @alias stopAll */
    if (data.match(keyboards.actions.stopAll)) {
      const {id, language_code: lang} = from;
      // eslint-disable-next-line consistent-return
      await BH2.stopAll(id);
      ctx.answerCbQuery(cbqId, {text: messages.stoppedAll(lang)});
      ctx.reply(messages.stoppedAll(lang), keyboards.hide());
      const keyb = keyboards.driver(lang);
      BH2.edit(id, mId, null, messages.home(lang), keyb);
    }
    /** @alias addRoute */
    if (data.match(keyboards.actions.addRoute)) {
      const {id, language_code: lang} = from;
      // eslint-disable-next-line consistent-return
      await BH2.addRoute(id);
      try {
        const txt = messages.driverStartNewRoute(lang);
        const keyb = keyboards.fr();
        ctx.reply(txt, keyb);
      } catch (e) {
        // system = `${e}${system}`;
      }
      ctx.answerCbQuery(cbqId, {text: messages.addName(lang)});
      return;
    }
    /** @alias start */
    /** @alias changeType */
    if (
      data.match(keyboards.actions.startAgree) ||
      data.match(keyboards.actions.changeType)
    ) {
      try {
        const {id: userId, language_code: lang} = from;
        const txt = messages.start2(lang);
        BH2.edit(userId, mId, null, txt, keyboards.begin(lang));
      } catch (e) {
        // system = `${e}${system}`;
      }
      return;
    }
    /** @alias settings */
    if (data.match(keyboards.actions.settings)) {
      try {
        const {id, language_code: lang} = from;
        const {total, count} = await BH2.getCounts(id);
        const txt = messages.settings(lang);
        const keyb = keyboards.settings(lang, count, total);
        BH2.edit(id, mId, null, txt, keyb);
      } catch (e) {
        // system = `${e}${system}`;
      }
      return;
    }
    /** @alias type */
    if (data.match(/type_([0-9])/)) {
      try {
        const [, type] = data.match(/type_([0-9])/);
        const {id, language_code: lang} = from;
        await BH2.driverTypeChange(from, type);
        const txt = messages.home(lang);
        const keyb = keyboards.driver(lang);
        BH2.edit(id, mId, null, txt, keyb);
        ctx.answerCbQuery(cbqId, {text: messages.account(lang)});
      } catch (e) {
        console.log(e);
        // system = `${e}${system}`;
      }
    }
    /** @alias page */
    if (data.match(/page_([0-9]+)/)) {
      try {
        const {id, language_code: lang} = from;
        const [, page] = data.match(/page_([0-9]+)/);
        const {cnt, routes = []} = await BH2.myRoutes(id, parseInt(page, 10));
        const pagi = getPagi(cnt, BH2.perPage, routes, parseInt(page, 10));
        const home = keyboards.home(lang);
        pagi.push(keyboards.addRoute(lang));
        pagi.push(home);
        const pagination = keyboards.inline(pagi);
        const txt = messages.routesList();
        BH2.edit(id, mId, null, txt, pagination);
      } catch (e) {
        console.log(e);
        // system = `${e}${system}`;
      }
    }
    /** @alias route */
    if (data.match(/route_(.*?)/)) {
      try {
        const {id, language_code: lang} = from;
        const [, _id, page] = data.match(/route_(.*?)_([0-9]+)$/);
        const route = await BH2.getRoute(id, _id);
        const {status} = route;
        const callbacks = [
          `page_${page}`,
          `${status === 1 ? 'deactivate' : 'activate'}_${_id}_${page}`,
        ];
        if (status === 1) {
          callbacks.push(`find_1_${_id}`);
        }
        console.log(lang);
        const keyb = keyboards.editRoute(lang, callbacks, status);
        BH2.edit(id, mId, null, printRouteOne([route], lang), keyb);
      } catch (e) {
        console.log(e);
        // system = `${e}${system}`;
      }
    }
    /** @alias status */
    if (data.match(/(activate|deactivate)_(.*?)/)) {
      try {
        const {id, language_code: lang} = from;
        const [, status, _id, page] = data.match(
          /(activate|deactivate)_(.*?)_([0-9]+)$/,
        );
        const {routes = []} = await BH2.setStatusRoute(id, _id, status);
        const callbacks = [
          `page_${page}`,
          `${status === 'activate' ? 'deactivate' : 'activate'}_${_id}_${page}`,
        ];
        if (status === 'activate') {
          callbacks.push(`find_${page}_${_id}`);
        }
        const stNum = status === 'activate' ? 1 : 0;
        console.log(lang);
        const keyb = keyboards.editRoute(lang, callbacks, stNum);
        await BH2.edit(id, mId, null, printRouteOne(routes, lang), keyb);
        const text = messages.status(stNum, lang, messages.icon(stNum));
        ctx.answerCbQuery(cbqId, {text});
      } catch (e) {
        console.log(e);
        // system = `${e}${system}`;
      }
    }
    /** @alias find */
    if (data.match(/find_(.*?)/)) {
      try {
        const {id, language_code: lang} = from;
        const [, page = '1', _id] = data.match(/find_([0-9]+)_(.*?)$/);
        const {cnt, routes = []} = await BH2.findRoutes(id, page, _id);
        const pagi = getPagi(cnt, 1, [], parseInt(page, 10), `${_id}_1`);
        const home = keyboards.home(lang);
        const back = [
          {
            text: messages.backJust(lang),
            callback_data: `route_${_id}_${page}`,
          },
        ];
        pagi.push(back);
        pagi.push(home);
        const pagination = keyboards.inline(pagi);
        BH2.edit(id, mId, null, printRouteFound(routes, lang), pagination);
      } catch (e) {
        console.log(e);
        // system = `${e}${system}`;
      }
    }
  });

  // eslint-disable-next-line consistent-return
  function test(ctx) {
    if (checkAdmin(ctx)) {
      return;
    }
    if (ctx.update && ctx.update.message) {
      if (ctx.update.message.location) {
        // eslint-disable-next-line consistent-return
        return BH2.processLocation(ctx);
      }
      const {
        from: {language_code: lang},
      } = ctx.update.message;
      if (
        ctx.update.message.reply_to_message &&
        ctx.update.message.reply_to_message.text.match(messages.check(lang))
      ) {
        // Send the name of your route
        BH2.nextProcessName(ctx);
      }
    }
  }

  bot.on('message', ctx => test(ctx));
};

module.exports = format;
