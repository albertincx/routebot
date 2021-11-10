const fs = require('fs');
const express = require('express');

const BotHelper = require('../utils/bot');
const messages = require('../../messages/format');
const keyboards = require('../../keyboards/keyboards');
const route = require('./route');
const db = require('../utils/db');

global.skipCount = 0;

const router = express.Router();
const filepath = 'count.txt';
const USERIDS = (process.env.USERIDS || '').split(',');
const IV_CHAN_ID = +process.env.IV_CHAN_ID;
const IV_CHAN_MID = +process.env.IV_CHAN_MID;
const supportLinks = [process.env.SUP_LINK];
for (let i = 1; i < 10; i += 1) {
  if (process.env[`SUP_LINK${i}`]) {
    supportLinks.push(process.env[`SUP_LINK${i}`]);
  }
}
if (!fs.existsSync(filepath)) fs.writeFileSync(filepath, '0');

let startCnt = parseInt(`${fs.readFileSync('count.txt')}`, 10);

const startOrHelp = async (ctx, botHelper) => {
  const {
    chat: {id: chatId},
  } = ctx.message;
  if (USERIDS.length && USERIDS.includes(`${chatId}`)) {
    return;
  }
  let system = JSON.stringify(ctx.message.from);
  try {
    await ctx.reply(messages.start3(), keyboards.hide());
    ctx.reply(messages.start(), keyboards.startFirst());
  } catch (e) {
    system = `${e}${system}`;
  }

  if (!botHelper.isAdmin(chatId)) {
    botHelper.sendAdmin(system);
  }
};

const support = async (ctx, botHelper) => {
  let system = JSON.stringify(ctx.message.from);
  const {
    chat: {id: chatId},
  } = ctx.message;

  try {
    const hide = Object.create(keyboards.hide());
    await ctx.reply(messages.support(supportLinks), {
      hide,
      disable_web_page_preview: true,
    });

    if (IV_CHAN_MID) {
      botHelper.forward(IV_CHAN_MID, IV_CHAN_ID * -1, chatId);
    }
  } catch (e) {
    system = `${e}${system}`;
  }
  botHelper.sendAdmin(`support ${system}`);
};
const botRoute = (bot, conn) => {
  const botHelper = new BotHelper(bot.telegram);
  if (conn) {
    conn.on('error', () => {
      botHelper.disDb();
    });
  } else {
    botHelper.disDb();
  }

  bot.command(['/start', '/help'], ctx => startOrHelp(ctx, botHelper));
  bot.command('support', ctx => support(ctx, botHelper));

  bot.command('config', ({message}) => {
    if (botHelper.isAdmin(message.chat.id)) {
      botHelper.toggleConfig(message);
    }
  });

  bot.command('stat', ctx => {
    if (botHelper.isAdmin(ctx.message.chat.id)) {
      db.stat().then(r => ctx.reply(r).catch(e => botHelper.sendError(e)));
    }
  });

  bot.command('srv', ({message}) => {
    if (botHelper.isAdmin(message.from.id)) {
      botHelper.sendAdmin(`srv: ${JSON.stringify(message)}`);
    }
  });

  route(bot, botHelper);
  bot.launch();

  if (startCnt % 10 === 0 || process.env.DEV) {
    botHelper.sendAdmin(`started ${startCnt} times`);
  }
  startCnt += 1;
  if (startCnt >= 500) {
    startCnt = 0;
  }

  fs.writeFileSync(filepath, parseInt(startCnt, 10).toString());
  return {router, bot: botHelper};
};

module.exports = botRoute;
