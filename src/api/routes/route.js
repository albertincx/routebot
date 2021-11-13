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
    chat: {id: chatId},
    text,
  } = ctx.message;
  if (!botHelper.isAdmin(chatId) || !text) {
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
  return keyboards.inline([...routs, keys]);
}

function printRouteOne(routes) {
  let txt = '';
  if (routes.length === 0) {
    return 'Nothing to show';
  }
  routes.forEach(r => {
    txt += `
Route name: ${r.name}
Status: ${r.status === 0 ? 'inactive 🔴' : 'active 🟢'}
`;
  });
  return txt;
}
function printRoute() {
  return 'Choose a route from the list below:';
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
  const pagi = getTotalPages(cnt, perPage);
  return getPagination(pageNum, pagi, routs, fromRoute);
}

const format = (bot, botHelper) => {
  const BH2 = new BotHelper2(botHelper);
  bot.command(['/createBroadcast', '/startBroadcast'], ctx =>
    broadcast(ctx, botHelper),
  );
  bot.hears(/[0-9]+,[0-9]+/, ctx => {
    if (checkAdmin(ctx)) {
      return;
    }
    BH2.processLocation(ctx, true);
  });
  bot.hears(BUTTONS.driver.label, ctx => BH2.driverType(ctx, 1));
  bot.hears(BUTTONS.sharingDriver.label, ctx => BH2.driverType(ctx, 2));
  bot.hears(BUTTONS.passenger.label, ctx => BH2.driverType(ctx, 3));
  bot.hears(BUTTONS.next.label, ctx => BH2.nextProcess(ctx));
  bot.hears(BUTTONS.addroute.label, ctx => BH2.nextProcess(ctx, false, true));
  bot.hears(BUTTONS.editroute.label, ctx => BH2.nextProcess(ctx));
  bot.hears(BUTTONS.stop_routes.label, ctx => BH2.stopAll(ctx));
  bot.hears(BUTTONS.routes.label, async ctx => {
    if (checkAdmin(ctx)) {
      return;
    }
    const {cnt, routes} = await BH2.myRoutes(ctx.chat.id);
    const pagi = getPagi(cnt, BH2.perPage, routes, 1);
    BH2.botMessage(ctx.chat.id, printRoute(), pagi);
  });
  bot.hears(BUTTONS.change_type.label, ctx => {
    if (checkAdmin(ctx)) {
      return;
    }
    ctx.reply(messages.start2(), keyboards.start());
  });
  bot.command(BUTTONS.driver.command, ctx => BH2.driverType(ctx, 1));
  bot.command(BUTTONS.sharingDriver.command, ctx => BH2.driverType(ctx, 2));
  bot.command(BUTTONS.passenger.command, ctx => BH2.driverType(ctx, 3));

  bot.action(/.*/, async ctx => {
    if (checkAdmin(ctx)) {
      return;
    }
    const [data] = ctx.match;
    if (data.match(/start_agree/)) {
      try {
        await ctx.reply(messages.start2(), keyboards.start());
      } catch (e) {
        // system = `${e}${system}`;
      }
      return;
    }
    if (data.match(/page_([0-9]+)/)) {
      try {
        const msg = ctx.update.callback_query;
        const {from, message} = msg;
        const {id} = from;
        const [, page] = data.match(/page_([0-9]+)/);
        const {cnt, routes = []} = await BH2.myRoutes(id, parseInt(page, 10));
        const pagi = getPagi(cnt, BH2.perPage, routes, parseInt(page, 10));
        BH2.edit(id, message.message_id, null, printRoute(), pagi);
      } catch (e) {
        console.log(e);
        // system = `${e}${system}`;
      }
    }
    if (data.match(/route_(.*?)/)) {
      try {
        const msg = ctx.update.callback_query;
        const {message} = msg;
        const {chat, message_id: mId} = message;
        const {id} = chat;
        const [, _id, page] = data.match(/route_(.*?)_([0-9]+)$/);
        const {routes = []} = await BH2.myRoutes(id, 1, _id);
        const {status} = routes[0];
        const callbacks = [
          `page_${page}`,
          `${status === 1 ? 'deactivate' : 'activate'}_${_id}_${page}`,
        ];
        if (status === 1) {
          callbacks.push(`find_1_${_id}_0`);
        }
        const keyb = keyboards.editRoute(callbacks, status);
        BH2.edit(id, mId, null, printRouteOne(routes), keyb);
      } catch (e) {
        console.log(e);
        // system = `${e}${system}`;
      }
    }
    if (data.match(/(activate|deactivate)_(.*?)/)) {
      try {
        const msg = ctx.update.callback_query;
        const {message} = msg;
        const {chat, message_id: mId} = message;
        const {id} = chat;
        const [, status, _id, page] = data.match(
          /(activate|deactivate)_(.*?)_([0-9]+)$/,
        );
        const {routes = []} = await BH2.setStatusRoute(id, _id, status);
        const callbacks = [
          `page_${page}`,
          `${status === 'activate' ? 'deactivate' : 'activate'}_${_id}_${page}`,
        ];
        if (status === 'activate') {
          callbacks.push(`find_${page}_${_id}_0`);
        }
        const keyb = keyboards.editRoute(
          callbacks,
          status === 'activate' ? 1 : 0,
        );
        BH2.edit(id, mId, null, printRouteOne(routes), keyb);
      } catch (e) {
        console.log(e);
        // system = `${e}${system}`;
      }
    }
    if (data.match(/find_(.*?)/)) {
      try {
        const msg = ctx.update.callback_query;
        const {message} = msg;
        const {chat, message_id: mId} = message;
        const {id} = chat;
        console.log(data);
        const [, page = '1', _id, newMid] = data.match(
          /find_([0-9]+)_(.*?)_(.*?)$/,
        );
        const {cnt, routes = []} = await BH2.findRoutes(id, page, _id);
        const pagi = getPagi(cnt, 1, [], parseInt(page, 10), `${_id}_${mId}`);
        console.log(newMid);
        if (newMid && newMid !== '0') {
          BH2.edit(id, newMid, null, printRouteOne(routes), pagi);
        } else {
          BH2.botMessage(id, printRouteOne(routes), pagi);
        }
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
        BH2.processLocation(ctx);
        return;
      }
      if (
        ctx.update.message.reply_to_message &&
        ctx.update.message.reply_to_message.text.match(messages.check)
      ) {
        // Send the name of your route
        BH2.nextProcess(ctx, true);
      }
    }
  }

  bot.on('message', ctx => test(ctx));
};

module.exports = format;
