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

const format = (bot, botHelper) => {
  const BH2 = new BotHelper2(botHelper);
  bot.command(['/createBroadcast', '/startBroadcast'], ctx =>
    broadcast(ctx, botHelper),
  );
  bot.hears(BUTTONS.driver.label, ctx => BH2.driverType(ctx, 1));
  bot.hears(BUTTONS.sharingDriver.label, ctx => BH2.driverType(ctx, 2));
  bot.hears(BUTTONS.passenger.label, ctx => BH2.driverType(ctx, 3));
  bot.hears(BUTTONS.next.label, ctx => BH2.nextProcess(ctx));
  bot.hears(BUTTONS.addroute.label, ctx => BH2.nextProcess(ctx, false, true));
  bot.hears(BUTTONS.editroute.label, ctx => BH2.nextProcess(ctx));
  bot.hears(BUTTONS.change_type.label, ctx => {
    ctx.reply(messages.start2(), keyboards.start());
  });
  bot.command(BUTTONS.driver.command, ctx => BH2.driverType(ctx, 1));
  bot.command(BUTTONS.sharingDriver.command, ctx => BH2.driverType(ctx, 2));
  bot.command(BUTTONS.passenger.command, ctx => BH2.driverType(ctx, 3));

  bot.action(/.*/, async ctx => {
    const [data] = ctx.match;
    logger('action');
    console.log(ctx);
    if (data.match(/start_agree/)) {
      try {
        await ctx.reply(messages.start2(), keyboards.start());
      } catch (e) {
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
};

module.exports = format;
