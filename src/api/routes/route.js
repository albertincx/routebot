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

function printRouteOne(r, lang) {
  if (!r) {
    return messages.routesEmpty(lang);
  }
  const status = messages.status(r.status, lang, messages.icon(r.status));
  return `
${messages.labelName(lang)}: ${r.name}
${messages.labelStatus(lang)}: ${status}

📍${messages.labelA(lang)}: \`\`\`${r.pointA.coordinates}\`\`\`
📍${messages.labelB(lang)}: \`\`\`${r.pointB.coordinates}\`\`\`
`;
}

function printRouteFound(routes, lang, type) {
  let txt = '';
  if (routes.length === 0) {
    return messages.routesEmpty(lang);
  }
  routes.forEach(r => {
    let tt = '';
    if (type === 0) {
      tt = `${messages.labelType(lang)}: ${messages.getType(lang, r.type)}`;
    }
    txt += `${tt}
${messages.labelName(lang)}: ${r.name}
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
    callback_data: `route_${r._id}_${pageNum}_none`,
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
      let system = '';
      try {
        const {txt, keyb} = await BH2.goHome(from);
        BH2.edit(from.id, mId, null, txt, keyb);
        ctx.answerCbQuery(cbqId, {text: ''});
      } catch (e) {
        system = `${e}${system}`;
      }
      if (system) {
        botHelper.sendAdmin(system);
      }
      return;
    }
    /** @alias stopAll */
    if (data.match(keyboards.actions.stopAll)) {
      const {id, language_code: lang} = from;
      const [, type] = data.match(/stop_all([0-9])/);
      // eslint-disable-next-line consistent-return
      await BH2.stopAll(id);
      ctx.answerCbQuery(cbqId, {text: messages.stoppedAll(lang)});
      ctx.reply(messages.stoppedAll(lang), keyboards.hide());
      const {txt, keyb} = BH2.goMenu(lang, parseInt(type, 10));
      // const txt = messages.home(lang, type);
      // const keyb = keyboards.driver(lang);
      BH2.edit(id, mId, null, txt, keyb);
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
        ctx.answerCbQuery(cbqId, {text: ''});
      } catch (e) {
        // system = `${e}${system}`;
      }
      return;
    }
    /** @alias settings */
    if (data.match(keyboards.actions.settings)) {
      try {
        const {id, language_code: lang} = from;
        const [, type] = data.match(/menu_settings([0-9])/);
        const {total = 0} = await BH2.getCounts(id);
        const txt = messages.settings(lang);
        const keyb = keyboards.settings(lang, total, type);
        BH2.edit(id, mId, null, txt, keyb);
        ctx.answerCbQuery(cbqId, {text: ''});
      } catch (e) {
        console.log(e);
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
        const {txt, keyb} = BH2.goMenu(lang, parseInt(type, 10));
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
        ctx.answerCbQuery(cbqId, {text: ''});
      } catch (e) {
        console.log(e);
        // system = `${e}${system}`;
      }
    }
    /** @alias route */
    if (data.match(/^route_(.*?)/)) {
      try {
        const {id, language_code: lang} = from;
        const [, _id, page, sendR] = data.match(/route_(.*?)_([0-9]+)_(.*?)$/);
        if (sendR && sendR.match('sendR')) {
          ctx.answerCbQuery(cbqId, {text: 'sent'});
          return;
        }
        const route = await BH2.getRoute(id, _id);
        const {status} = route;
        const callbacks = [
          `page_${page}`,
          `${status === 1 ? 'deactivate' : 'activate'}_${_id}_${page}`,
        ];
        if (status === 1) {
          callbacks.push(`find_1_${_id}_3`);
          callbacks.push(`find_1_${_id}_0`);
        }
        const keyb = keyboards.editRoute(lang, callbacks, status);
        BH2.edit(id, mId, null, printRouteOne(route, lang), keyb);
        ctx.answerCbQuery(cbqId, {text: ''});
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
        const route = await BH2.setStatusRoute(id, _id, status);
        const callbacks = [
          `page_${page}`,
          `${status === 'activate' ? 'deactivate' : 'activate'}_${_id}_${page}`,
        ];
        if (status === 'activate') {
          callbacks.push(`find_${page}_${_id}_3`);
          callbacks.push(`find_${page}_${_id}_0`);
        }
        const stNum = status === 'activate' ? 1 : 0;
        const keyb = keyboards.editRoute(lang, callbacks, stNum);
        await BH2.edit(id, mId, null, printRouteOne(route, lang), keyb);
        const text = messages.status(stNum, lang, messages.icon(stNum));
        ctx.answerCbQuery(cbqId, {text});
      } catch (e) {
        console.log(e);
        // system = `${e}${system}`;
      }
    }
    /** @alias find */
    if (data.match(/^find_(.*?)/)) {
      try {
        const {id, language_code: lang} = from;
        const [, pag = 1, _id, typ] = data.match(
          /find_([0-9]+)_(.*?)_([0-9])$/,
        );
        const page = parseInt(pag, 10);
        const type = parseInt(typ, 10);
        const {cnt, routes = []} = await BH2.findRoutes(id, page, _id, type);
        const pagi = getPagi(cnt, 1, [], page, `${_id}_1_${type}`);
        const home = keyboards.home(lang);
        const back = [
          {
            text: messages.backJust(lang),
            callback_data: `route_${_id}_${page}_none`,
          },
        ];
        if (routes[0]) {
          const sendRequest = [
            {
              text: messages.sendRequest(lang),
              callback_data: `route_${_id}_${page}_sendR_${id}_${routes[0].userId}`,
            },
          ];
          pagi.push(sendRequest);
        }
        pagi.push(back);
        pagi.push(home);
        const pagination = keyboards.inline(pagi);
        const view = printRouteFound(routes, lang, type);
        BH2.edit(id, mId, null, view, pagination);
        ctx.answerCbQuery(cbqId, {text: ''});
      } catch (e) {
        console.log(e);
        // system = `${e}${system}`;
      }
    }
  });

  // eslint-disable-next-line consistent-return
  /** @alias processMessage */
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
