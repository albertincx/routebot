const _ = require('lodash');

const keyboards = require('../../keyboards/keyboards');
const messages = require('../../messages/format');
const BUTTONS = require('../../config/buttons');
const db = require('../utils/db');
const {checkAdmin} = require('../utils');
const {showError} = require('../utils');

const rabbitmq = require('../../service/rabbitmq');
const BotHelper2 = require('./bot/route');

rabbitmq.startChannel();
global.lastIvTime = +new Date();
const NONE = 'none';
const DEAC = 'deactivate';
const ACTI = 'activate';
const SUBS = 'subscribe';
const UNSUB = 'unsubscribe';
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

function printRouteOne(r, lang, showPoints = true) {
  if (!r) {
    return messages.routesEmpty(lang);
  }
  const {name, status, notify, pointA, pointB, hourA, hourB} = r;
  const statu = messages.showStatus(status, lang, messages.icon(status));
  const notif = messages.showStatus(notify, lang, messages.icon(notify), 'а');
  let txt = `
${messages.labelName(lang)}: ${name}
${messages.labelStatus(lang)}: ${statu}
${messages.labelSubs(lang)}: ${notif}

`;
  if (showPoints) {
    txt += `📍${messages.labelA(lang)}: \`\`\`${pointA.coordinates}\`\`\`
📍${messages.labelB(lang)}: \`\`\`${pointB.coordinates}\`\`\``;
  }
  if (hourA) {
    txt += `${messages.labelTimeA(lang)}: \`\`\`${hourA}\`\`\`
${messages.labelTimeB(lang)}: \`\`\`${hourB}\`\`\``;
  }
  return txt;
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
    callback_data: `route_${r._id}_${pageNum}_${NONE}`,
  }));
  const routs = _.chunk(routs1, 3);
  const pages = getTotalPages(cnt, perPage);
  return getPagination(pageNum, pages, routs, fromRoute);
}
const getRouteCb = (_id, page, status, notify) => [
  `route_${_id}_${page}_${NONE}`,
  `${status === 1 ? DEAC : ACTI}_${_id}_${page}`,
  `${notify === 1 ? UNSUB : SUBS}_${_id}_${page}`,
  `t_fromA_${_id}_${page}_start`,
  `delete_route_${_id}_${page}`,
];
const format = (bot, botHelper) => {
  const BH2 = new BotHelper2(botHelper);
  bot.command(['/createBroadcast', '/startBroadcast'], ctx =>
    broadcast(ctx, botHelper),
  );
  bot.hears(/([0-9.]+),[\s+]?([0-9.]+)/, ctx => {
    if (checkAdmin(ctx)) {
      return;
    }
    try {
      const coords = [ctx.match[1], ctx.match[2]].map(Number);
      // eslint-disable-next-line consistent-return
      return BH2.processLocation(ctx, coords);
    } catch (e) {
      showError(e);
    }
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
        showError(e);
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
        showError(e);
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
        pagi.push(keyboards.addRoute(lang));
        const pagination = keyboards.inline(pagi, lang, true);
        const txt = messages.routesList();
        BH2.edit(id, mId, null, txt, pagination);
        ctx.answerCbQuery(cbqId, {text: ''});
      } catch (e) {
        showError(e);
        // system = `${e}${system}`;
      }
    }
    /** @alias request */
    if (data.match(/^req_(.*?)/)) {
      try {
        const {language_code: lang} = from;
        const [, _id, page, sendR] = data.match(/req_(.*?)_([0-9]+)_(.*?)$/);
        let text = 'error';
        const route = await BH2.getRouteById(_id, 'name userId');
        if (route) {
          const requestUserId = page;
          const {name, userId} = route;
          const reqData = {from: requestUserId, to: userId, routeId: _id};
          const req = await BH2.getRequest(reqData);
          if (req) {
            text = messages.sentAlready(lang);
            ctx.answerCbQuery(cbqId, {text});
            return;
          }
          let txt;
          if (sendR.match(keyboards.actions.sendR)) {
            txt = messages.notifyUserDriver(lang, name);
            text = messages.sentR(lang);
          }
          if (sendR.match(keyboards.actions.send3R)) {
            txt = messages.notifyUserCoop(lang, name);
            text = messages.sent3R(lang);
          }
          if (txt) {
            BH2.botMessage(userId, txt);
          }
        }
        ctx.answerCbQuery(cbqId, {text});
      } catch (e) {
        showError(e);
      }
    }
    /** @alias route */
    if (data.match(/^route_(.*?)/)) {
      try {
        const {id, language_code: lang} = from;
        const [, _id, page, sendR] = data.match(/route_(.*?)_([0-9]+)_(.*?)$/);
        let text = '';
        if (sendR && sendR.match(/time_/)) {
          // save B time and
          const hour = parseInt(sendR.replace('time_', ''), 10);
          await BH2.setStatusRoute(id, _id, hour, 'hourB');
          text = messages.editTimeOk(lang, true);
        }
        const route = await BH2.getRoute(id, _id, 'notify status');
        const {status, notify} = route;
        const editBtn = `edit_${_id}_${page}`;
        const callbacks = [`page_${page}`, editBtn];
        if (status === 1) {
          callbacks.push(`find_1_${_id}_3`);
          callbacks.push(`find_1_${_id}_0`);
        }
        const keyb = keyboards.detailRoute(lang, callbacks, status, notify);
        BH2.edit(id, mId, null, printRouteOne(route, lang), keyb);
        ctx.answerCbQuery(cbqId, {text});
      } catch (e) {
        showError(e);
        // system = `${e}${system}`;
      }
    }
    /** @alias edit */
    if (data.match(/^edit_(.*?)/)) {
      try {
        const {id, language_code: lang} = from;
        const [, _id, page] = data.match(/edit_(.*?)_([0-9]+)$/);
        const route = await BH2.getRoute(id, _id, 'notify status');
        const {status, notify} = route;
        const callbacks = getRouteCb(_id, page, status, notify);
        const keyb = keyboards.editRoute(lang, callbacks, status, notify);
        BH2.edit(id, mId, null, printRouteOne(route, lang, false), keyb);
        ctx.answerCbQuery(cbqId, {text: ''});
      } catch (e) {
        showError(e);
        // system = `${e}${system}`;
      }
    }
    /** @alias edit */
    if (data.match(/^(t_fromA|t_fromB)_(.*?)/)) {
      try {
        const {id, language_code: lang} = from;
        const [, fromPoint, _id, page, when] = data.match(
          /(t_fromA|t_fromB)_(.*?)_([0-9]+)_(.*?)$/,
        );
        let cbPath = `t_fromB_${_id}_${page}`;
        const isFrB = fromPoint === 't_fromB';
        const backCb = isFrB
          ? `t_fromA_${_id}_${page}_start`
          : `edit_${_id}_${page}`;
        if (isFrB) {
          cbPath = `route_${_id}_${page}`;
        }
        const text = messages.editTimeSuccess(lang, isFrB);
        const back = [{text: messages.backJust(lang), callback_data: backCb}];
        const txt = messages.editTime(lang, isFrB);
        if (Number.isFinite(parseInt(when, 10))) {
          // await save [fromPoint]
          const hour = parseInt(when, 10);
          await BH2.setStatusRoute(id, _id, hour, 'hourA');
        }
        const keys = keyboards.editTime(lang, when, isFrB, cbPath, true);
        const keyb = keyboards.withHome(lang, [back, ...keys]);
        BH2.edit(id, mId, null, txt, keyb);
        ctx.answerCbQuery(cbqId, {text});
      } catch (e) {
        showError(e);
        // system = `${e}${system}`;
      }
    }
    /** @alias status */
    if (data.match(/^(activate|deactivate|unsubscribe|subscribe)_(.*?)/)) {
      try {
        const {id, language_code: lang} = from;
        const [, status, _id, page] = data.match(
          /^(activate|deactivate|unsubscribe|subscribe)_(.*?)_([0-9]+)$/,
        );
        const field = data.match(SUBS) ? 'notify' : 'status';
        const route = await BH2.setStatusRoute(id, _id, status, field);
        const editBtn = `edit_${_id}_${page}`;
        const callbacks = [`page_${page}`, editBtn];
        if (route.status === 1) {
          callbacks.push(`find_${page}_${_id}_3`);
          callbacks.push(`find_${page}_${_id}_0`);
        }
        let stNum;
        let ntNum;
        if (field === 'status') {
          stNum = status === ACTI ? 1 : 0;
          ntNum = route.notify;
        } else {
          stNum = route.status;
          ntNum = status === SUBS ? 1 : 0;
        }
        const keyb = keyboards.detailRoute(lang, callbacks, stNum, ntNum);
        const txt = printRouteOne(route, lang);
        await BH2.edit(id, mId, null, txt, keyb);
        let pop = messages.showStatus(stNum, lang, messages.icon(stNum));
        if (field === 'notify') {
          pop = messages.statusSubscribe(ntNum, lang, messages.icon(ntNum));
        }
        ctx.answerCbQuery(cbqId, {text: pop});
      } catch (e) {
        showError(e);
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
        const pagi = getPagi(cnt, 1, [], page, `${_id}_${type}`);
        const back = [
          {
            text: messages.backJust(lang),
            callback_data: `route_${_id}_${page}_${NONE}`,
          },
        ];
        if (routes[0]) {
          let text = messages.sendRequest(lang);
          let act = keyboards.actions.sendR;
          if (type === 3) {
            text = messages.sendRequest3(lang);
            act = keyboards.actions.send3R;
          }
          const sendRequest = [
            {
              text,
              callback_data: `req_${routes[0].pointAId}_${id}_${act}_1`,
            },
          ];
          pagi.push(sendRequest);
        }
        pagi.push(back);
        const pagination = keyboards.inline(pagi, lang, true);
        const view = printRouteFound(routes, lang, type);
        BH2.edit(id, mId, null, view, pagination);
        ctx.answerCbQuery(cbqId, {text: ''});
      } catch (e) {
        showError(e);
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
      const {location, reply_to_message: rplMess} = ctx.update.message;
      if (location) {
        try {
          // eslint-disable-next-line consistent-return
          return BH2.processLocation(ctx);
        } catch (e) {
          showError(e);
        }
      }
      if (rplMess) {
        const {from} = ctx.update.message;
        const {language_code: lang} = from;
        if (rplMess.text.match(messages.check(lang))) {
          // Send the name of your route
          BH2.nextProcessName(ctx);
        }
      }
    }
  }

  bot.on('message', ctx => test(ctx));
};

module.exports = format;
