const keyboards = require('../../keyboards/keyboards');
const messages = require('../../messages/format');
const BUTTONS = require('../../config/buttons');
const db = require('../utils/db');
const logger = require('../utils/logger');

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

function getPage(i) {
  return `page_${i}`;
}

function getPagination(current, total) {
  const keys = [];
  if (current > 1) {
    keys.push({text: '«1', callback_data: getPage(1)});
  }
  if (current > 2) {
    keys.push({
      text: `‹${current - 1}`,
      callback_data: getPage(current - 1),
    });
  }
  keys.push({text: `-${current}-`, callback_data: getPage(current)});
  if (current < total - 1) {
    keys.push({
      text: `${current + 1}›`,
      callback_data: getPage(current + 1),
    });
  }
  if (current < total) {
    keys.push({text: `${total}»`, callback_data: getPage(total)});
  }
  console.log(keys);
  if (keys.length === 1) {
    return null;
  }
  return keyboards.inline(keys);
}

function printRoute(routes) {
  let txt = 'Your regular routes\n';
  if (routes.length === 0) {
    return 'Nothing to show';
  }
  routes.forEach(r => {
    txt += `
Route name: ${r.name}
Status: ${r.status === 0 ? 'inactive 🔴' : 'active 🟢'}
${r.status === 0 ? `/activate_${r._id}` : `/deactivate_${r._id}`}
`;
  });
  return txt;
}
function getTotalPages(cnt, perPage) {
  return cnt <= perPage ? 1 : cnt / perPage;
}
const format = (bot, botHelper) => {
  const BH2 = new BotHelper2(botHelper);
  bot.command(['/createBroadcast', '/startBroadcast'], ctx =>
    broadcast(ctx, botHelper),
  );
  bot.hears(/[0-9]+,[0-9]+/, ctx => BH2.processLocation(ctx, true));
  bot.hears(BUTTONS.driver.label, ctx => BH2.driverType(ctx, 1));
  bot.hears(BUTTONS.sharingDriver.label, ctx => BH2.driverType(ctx, 2));
  bot.hears(BUTTONS.passenger.label, ctx => BH2.driverType(ctx, 3));
  bot.hears(BUTTONS.next.label, ctx => BH2.nextProcess(ctx));
  bot.hears(BUTTONS.addroute.label, ctx => BH2.nextProcess(ctx, false, true));
  bot.hears(BUTTONS.editroute.label, ctx => BH2.nextProcess(ctx));
  bot.hears(BUTTONS.stop_routes.label, ctx => BH2.stopAll(ctx));
  bot.hears(BUTTONS.routes.label, async ctx => {
    const {cnt, routes} = await BH2.myRoutes(ctx.chat.id);
    BH2.botMessage(
      ctx.chat.id,
      printRoute(routes),
      getPagination(1, getTotalPages(cnt, BH2.perPage)),
    );
  });
  bot.hears(BUTTONS.change_type.label, ctx => {
    ctx.reply(messages.start2(), keyboards.start());
  });
  bot.command(BUTTONS.driver.command, ctx => BH2.driverType(ctx, 1));
  bot.command(BUTTONS.sharingDriver.command, ctx => BH2.driverType(ctx, 2));
  bot.command(BUTTONS.passenger.command, ctx => BH2.driverType(ctx, 3));
  bot.hears(/(activate|deactivate)_(.*?)+/, ctx => BH2.setStatus(ctx));

  bot.action(/.*/, async ctx => {
    const [data] = ctx.match;
    logger('action');
    if (data.match(/start_agree/)) {
      try {
        await ctx.reply(messages.start2(), keyboards.start());
      } catch (e) {
        // system = `${e}${system}`;
      }
      // await bot.telegram
      //   .editMessageText(from.id, message_id, null, RESULT, keyboards.start())
      //   .catch(console.log);
      return;
    }
    if (data.match(/page_([0-9]+)/)) {
      try {
        const msg = ctx.update.callback_query;
        const {from, message} = msg;
        const {id} = from;
        const [, page] = data.match(/page_([0-9]+)/);
        const {cnt, routes = []} = await BH2.myRoutes(id, parseInt(page, 10));
        BH2.edit(
          id,
          message.message_id,
          null,
          printRoute(routes),
          getPagination(parseInt(page, 10), getTotalPages(cnt, BH2.perPage)),
        );
      } catch (e) {
        console.log(e);
        // system = `${e}${system}`;
      }
      // await bot.telegram
      //   .editMessageText(from.id, message_id, null, RESULT, keyboards.start())
      //   .catch(console.log);
    }
    if (data.match(/(inactive|active)_(.*?)/)) {
      try {
        // const msg = ctx.update.callback_query;
        // const {from, message} = msg;
        // const {id} = from;
        // const [, page] = data.match(/page_([0-9]+)/);
        // console.log('page = ', page);
        // const {cnt, routes = []} = await BH2.myRoutes(id, parseInt(page, 10));
        // BH2.edit(
        //   id,
        //   message.message_id,
        //   null,
        //   printRoute(routes),
        //   getPagination(parseInt(page, 10), getTotalPages(cnt, BH2.perPage)),
        // );
      } catch (e) {
        console.log(e);
        // system = `${e}${system}`;
      }
      // await bot.telegram
      //   .editMessageText(from.id, message_id, null, RESULT, keyboards.start())
      //   .catch(console.log);
    }
  });

  bot.on('chosen_inline_result', ({chosenInlineResult}) => {
    console.log('chosen inline result', chosenInlineResult);
  });

  // eslint-disable-next-line consistent-return
  function test(c) {
    if (c.update && c.update.message) {
      // console.log(c, t,  ' 2');
      if (c.update.message.location) {
        return BH2.processLocation(c);
      }
      if (
        c.update.message.reply_to_message &&
        c.update.message.reply_to_message.text.match(messages.check)
      ) {
        // Send the name of your route
        return BH2.nextProcess(c, true);
      }
    }
  }

  bot.on('message', ctx => test(ctx));

  // bot.on('callback_query', async message => {
  //   console.log('test')
  //   const msg = message.message;
  //   const {total: cnt, routes = []} = await BH2.myRoutes(
  //     msg.chat.id,
  //     parseInt(message.data, 10),
  //   );
  //   console.log(routes);
  //   const editOptions = {
  //     ...getPagination(parseInt(message.data, 10), cnt),
  //     chat_id: msg.chat.id,
  //     message_id: msg.message_id,
  //   };
  //
  //   bot.editMessageText(`Page: ${message.data}`, editOptions);
  // });
};

module.exports = format;
