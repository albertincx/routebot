const _ = require('lodash');

const keyboards = require('../../keyboards/keyboards');
const messages = require('../../messages/format');
const BUTTONS = require('../../config/buttons');
const {checkAdmin} = require('../utils');
const {showError} = require('../utils');
const {printRouteOne, printRouteFound} = require('./view/route');

const rabbitmq = require('../../service/rabbitmq');
const BotHelper2 = require('./bot/route');

rabbitmq.startChannel();
global.lastIvTime = +new Date();
const NONE = 'none';
const DEAC = 'st_dea';
const ACTI = 'st_act';
const SUBS = 'st_sub';
const UNSUB = 'st_uns';

function getPage(i, fromRoute = '') {
  if (fromRoute) {
    return `find_${i}_${fromRoute}`;
  }
  return `page_${i}`;
}

function getPagination(current, total, fromRoute) {
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
  return keys;
}

const stReg = `^(${ACTI}|${DEAC})_(.*?)`;
const hoursReg = '^(t_fromA|t_fromB)_(.*?)';

function newReg(str) {
  return new RegExp(str);
}

function getTotalPages(cnt, perPage) {
  return cnt <= perPage ? 1 : Math.ceil(cnt / perPage);
}

function getPagiRoutes(routes, cnt, perPage, pageNum = 1) {
  const routs1 = routes.map(r => ({
    text: `${messages.icon(r.status)} ${r.name}`,
    callback_data: `route_${r._id}_${pageNum}_${NONE}`,
  }));
  const routs = _.chunk(routs1, 3);
  const pages = getTotalPages(cnt, perPage);
  const keys = getPagination(pageNum, pages);
  if (keys.length) {
    return [...routs, keys];
  }
  return [];
}

function getPagi(cnt, perPage, pageNum = 1, fromRoute = '') {
  const pages = getTotalPages(cnt, perPage);
  const keys = getPagination(pageNum, pages, fromRoute);
  if (keys.length) {
    return [keys];
  }
  return [];
}

const getRouteCb = (_id, page, status, notify) => [
  `route_${_id}_${page}_${NONE}`,
  `${status === 1 ? DEAC : ACTI}_${_id}_${page}`,
  `route_${_id}_${page}_${notify === 1 ? UNSUB : SUBS}`,
  `t_fromA_${_id}_${page}_start`,
  `delete_route_${_id}_${page}`,
];
const format = (bot, botHelper) => {
  const BH2 = new BotHelper2(botHelper);
  bot.command(['/createBroadcast', '/startBroadcast'], ctx =>
    BH2.broadcast(ctx, botHelper),
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
        const pagi = getPagiRoutes(
          routes,
          cnt,
          BH2.perPage,
          parseInt(page, 10),
        );
        pagi.push(keyboards.addRoute(lang));
        const pagination = keyboards.withHome(lang, pagi);
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
        const [, _id, requestUserId, sendR, userId] = data.match(
          /req_(.*?)_([0-9]+)_(.*?)_([0-9]+)$/,
        );
        let text = 'error';
        const reqData = {from: +requestUserId, to: +userId, routeId: _id};
        const req = await BH2.getRequest(reqData);
        if (req) {
          text = messages.sentAlready(lang);
          ctx.answerCbQuery(cbqId, {text});
          return;
        }
        const route = await BH2.getRouteById(_id, 'name');
        if (route) {
          const {name} = route;
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
        if (sendR) {
          if (sendR.match(/time_/)) {
            const v = parseFloat(sendR.replace('time_', ''));
            await BH2.setFieldRoute(id, _id, v, 'hourB');
            text = messages.editTimeOk(lang, true);
          }
          if (sendR.match(/st_(sub|uns)/)) {
            const v = sendR === SUBS ? 1 : 0;
            await BH2.setFieldRoute(id, _id, v, 'notify');
            text = messages.statusSubscribe(lang, v, messages.icon(v));
          }
        }
        const route = await BH2.getRoute(id, _id, 'notify status hourA hourB');
        const {status, hourA, hourB} = route;
        const editBtn = `edit_${_id}_${page}`;
        const callbacks = [`page_${page}`, editBtn];
        const noTime = Number.isNaN(hourA) || !hourB;
        if (status === 1) {
          callbacks.push(`find_1_${_id}_3`);
          callbacks.push(`find_1_${_id}_0`);
        } else if (noTime) {
          callbacks.push(`t_fromA_${_id}_${page}_start`);
        }
        const keyb = keyboards.detailRoute(lang, callbacks, noTime);
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
        const route = await BH2.getRoute(id, _id, 'notify status hourA hourB');
        const {status, notify} = route;
        const callbacks = getRouteCb(_id, page, status, notify);
        const keyb = keyboards.editRoute(lang, callbacks, route);
        BH2.edit(id, mId, null, printRouteOne(route, lang, false), keyb);
        ctx.answerCbQuery(cbqId, {text: ''});
      } catch (e) {
        showError(e);
        // system = `${e}${system}`;
      }
    }
    /** @alias edit */
    /** @function edit */
    /** @name hours */
    if (data.match(newReg(hoursReg))) {
      try {
        const {id, language_code: lang} = from;
        const [, frP, _id, page, _H] = data.match(
          newReg(`${hoursReg}_([0-9]+)_(.*?)$`),
        );
        let cbPath = `t_fromB_${_id}_${page}`;
        const isFrB = frP === 't_fromB';
        const backCb = isFrB
          ? `t_fromA_${_id}_${page}_start`
          : `edit_${_id}_${page}`;
        if (isFrB) {
          cbPath = `route_${_id}_${page}`;
        }
        const text = messages.editTimeSuccess(lang, isFrB);
        const back = [{text: messages.backJust(lang), callback_data: backCb}];
        const txt = messages.editTime(lang, isFrB);
        if (Number.isFinite(parseInt(_H, 10))) {
          const v = parseFloat(_H);
          await BH2.setFieldRoute(id, _id, v, 'hourA');
        }
        const keys = keyboards.editTime(lang, isFrB, cbPath, true);
        const keyb = keyboards.withHome(lang, [back, ...keys]);
        BH2.edit(id, mId, null, txt, keyb);
        ctx.answerCbQuery(cbqId, {text});
      } catch (e) {
        showError(e);
        // system = `${e}${system}`;
      }
    }
    /** @alias status */
    if (data.match(newReg(stReg))) {
      try {
        const {id, language_code: lang} = from;
        const [, status, _id, page] = data.match(newReg(`${stReg}_([0-9]+)$`));
        const v = status === ACTI ? 1 : 0;
        const route = await BH2.setStatusRoute(id, _id, v);
        const editBtn = `edit_${_id}_${page}`;
        const callbacks = [`page_${page}`, editBtn];
        if (route.error) {
          const t = messages.timeError(lang, route.field);
          ctx.answerCbQuery(cbqId, {text: t});
          return;
        }
        if (route.status === 1) {
          callbacks.push(`find_${page}_${_id}_3`);
          callbacks.push(`find_${page}_${_id}_0`);
        }
        const stNum = status === ACTI ? 1 : 0;
        const keyb = keyboards.detailRoute(lang, callbacks);
        const txt = printRouteOne(route, lang);
        await BH2.edit(id, mId, null, txt, keyb);
        const pop = messages.showStatus(stNum, lang, messages.icon(stNum));
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
        const pagi = getPagi(cnt, 1, page, `${_id}_${type}`);
        const back = [
          {
            text: messages.backJust(lang),
            callback_data: `route_${_id}_${page}_${NONE}`,
          },
          {
            text: messages.menu(lang),
            callback_data: keyboards.actions.startHome,
          },
        ];
        pagi.push(back);
        const preKeys = [];
        if (routes[0]) {
          let text = messages.sendRequest(lang);
          let act = keyboards.actions.sendR;
          if (type === 3) {
            // offer for same passenger
            text = messages.sendRequest3(lang);
            act = keyboards.actions.send3R;
          }
          const {pointAId, userId, notify} = routes[0];
          let sendRequest;
          if (!notify) {
            // act = keyboards.actions.send3R;
            sendRequest = [
              {
                text,
                callback_data: `req_${pointAId}_${id}_${act}_${userId}`,
              },
            ];
          } else {
            sendRequest = [
              {
                text,
                callback_data: `req_${pointAId}_${id}_${act}_${userId}`,
              },
            ];
          }
          if (sendRequest) {
            preKeys.push(sendRequest);
          }
        }
        const keys = [...preKeys, ...pagi];
        const pagination = keyboards.withHome(lang, keys, false);
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
