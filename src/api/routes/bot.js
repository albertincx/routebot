const fs = require('fs');
const express = require('express');

const BotHelper = require('../utils/bot');
const messages = require('../../messages/format');
const keyboards = require('../../keyboards/keyboards');
// const route = require('./route');
const db = require('../utils/db');

global.skipCount = 0;

const router = express.Router();
const filepath = 'count.txt';
const USERIDS = (process.env.USERIDS || '').split(',');

if (!fs.existsSync(filepath)) fs.writeFileSync(filepath, '0');

let startCnt = parseInt(`${fs.readFileSync('count.txt')}`, 10);
const startOrHelp = (ctx, botHelper) => {
  if (!ctx.message) {
    // return botHelper.sendAdmin(JSON.stringify(ctx.update));
    const {
      chat: {id: chatId},
    } = ctx.message;
    if (USERIDS.length && USERIDS.includes(`${chatId}`)) {
      return;
    }
  } else {
    const {
      chat: {id: chatId},
    } = ctx.message;
    if (USERIDS.length && USERIDS.includes(`${chatId}`)) {
      return;
    }
  }
  let system = JSON.stringify(ctx.message.from);
  try {
    ctx.reply(messages.start(), keyboards.start());
  } catch (e) {
    system = `${e}${system}`;
  }

  botHelper.sendAdmin(system);
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

  // route(bot, botHelper);
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
