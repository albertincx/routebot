const fs = require('fs');
const express = require('express');

const BotHelper = require('../utils/bot');
const messages = require('../../messages/format');
const keyboards = require('../../keyboards/keyboards');
<<<<<<< HEAD
// const route = require('./route');
const db = require('../utils/db');
=======
const route = require('./route');
const db = require('../utils/db');
const {checkAdmin} = require('../utils');
>>>>>>> 7284fba8010dfc6892d6ddf149d16ae33318382e

global.skipCount = 0;

const router = express.Router();
const filepath = 'count.txt';
const USERIDS = (process.env.USERIDS || '').split(',');
<<<<<<< HEAD

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
=======
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
  if (checkAdmin(ctx)) {
    return;
  }
  if (USERIDS.length && USERIDS.includes(`${chatId}`)) {
    return;
  }
  let system = JSON.stringify(ctx.message.from);
  try {
    await ctx.reply(messages.start3(), keyboards.hide());
    ctx.reply(messages.start(), keyboards.startFirst());
>>>>>>> 7284fba8010dfc6892d6ddf149d16ae33318382e
  } catch (e) {
    system = `${e}${system}`;
  }

<<<<<<< HEAD
  botHelper.sendAdmin(system);
};

=======
  if (!botHelper.isAdmin(chatId)) {
    botHelper.sendAdmin(system);
  }
};

const support = async (ctx, botHelper) => {
  if (checkAdmin(ctx)) {
    return;
  }
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
>>>>>>> 7284fba8010dfc6892d6ddf149d16ae33318382e
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
<<<<<<< HEAD
=======
  bot.command('support', ctx => support(ctx, botHelper));
>>>>>>> 7284fba8010dfc6892d6ddf149d16ae33318382e

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

<<<<<<< HEAD
  // route(bot, botHelper);
=======
  route(bot, botHelper);
>>>>>>> 7284fba8010dfc6892d6ddf149d16ae33318382e
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
