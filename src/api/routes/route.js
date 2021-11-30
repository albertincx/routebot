const _ = require('lodash');

const keyboards = require('../../keyboards/keyboards');
const messages = require('../../messages/format');
const BUTTONS = require('../../config/buttons');
const {checkAdmin} = require('../utils');
const {showError} = require('../utils');
const {printRouteOne, printRouteFound} = require('./view/route');

const rabbitmq = require('../../service/rabbitmq');
const BotHelper2 = require('./bot/route');
const {processSendR} = require('./bot/request');

rabbitmq.startChannel();
global.lastIvTime = +new Date();

const EDIT_ = 'edit_';
const NONE = 'none';
const DEAC = 'st_dea';
const ACTI = 'st_act';
const SUBS = 'st_sub';
const UNSUB = 'st_uns';
const stReg = `^(${ACTI}|${DEAC})_(.*?)`;
const HOUR_A = 't_fromA';
const HOUR_B = 't_fromB';
const hoursReg = '^(t_fromA|t_fromB)_(.*?)';

const DIST_A = 'set_distA';
const DIST_B = 'set_distB';
const distReg = `^(${DIST_A}|${DIST_B})_(.*?)`;

const getRouteCb = (_id, page, status, notify) => [
  `route_${_id}_${page}_${NONE}`,
  `${status === 1 ? DEAC : ACTI}_${_id}_${page}`,
  `route_${_id}_${page}_${notify === 1 ? UNSUB : SUBS}`,
];

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

function newReg(str) {
  return new RegExp(str);
}

function getTotalPages(cnt, perPage) {
  return cnt <= perPage ? 1 : Math.ceil(cnt / perPage);
}

function getPagiRoutes(routes, pageNum = 1) {
  return _.chunk(
    routes.map(r => ({
      text: `${messages.icon(r.status)} ${r.name}`,
      callback_data: `route_${r._id}_${pageNum}_${NONE}`,
    })),
    3,
  );
}

function getPagi(cnt, perPage, pageNum = 1, fromRoute = '') {
  const pages = getTotalPages(cnt, perPage);
  const keys = getPagination(pageNum, pages, fromRoute);
  if (keys.length) {
    return [keys];
  }
  return [];
}

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
      const coords = [ctx.match[2], ctx.match[1]].map(Number);
      // eslint-disable-next-line consistent-return
      return BH2.processLocation(ctx, coords);
    } catch (e) {
      BH2.sendError(e);
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
    const {id, language_code: lang} = from;
    const {id: cbqId} = msg;
    const [data] = ctx.match;
    /** @alias SET_USERNAME */

    if (data.match(keyboards.actions.iSetUName)) {
      let text = '';
      try {
        if (from.username) {
          await BH2.setUsername(from);
          const txt = messages.setUpUname(lang);
          const {keyb} = await BH2.goHome(from);
          await BH2.edit(from.id, mId, null, txt, keyb);
        } else {
          text = messages.noUnameW(lang);
        }
      } catch (e) {
        text = 'err';
        BH2.sendError(e);
      }
      ctx.answerCbQuery(cbqId, {text});
      return;
    }
    /** @alias startHome */

    if (data.match(keyboards.actions.startHome)) {
      let text = '';
      try {
        const {txt, keyb} = await BH2.goHome(from);
        await BH2.edit(from.id, mId, null, txt, keyb);
      } catch (e) {
        text = 'err';
        await BH2.sendError(e);
      }
      ctx.answerCbQuery(cbqId, {text});
      return;
    }
    /** @alias stopAll */
    if (data.match(keyboards.actions.stopAll)) {
      try {
        const [, type] = data.match(/stop_all([0-9])/);
        // eslint-disable-next-line consistent-return
        await BH2.stopAll(id);
        ctx.reply(messages.stoppedAll(lang), keyboards.hide());
        const {txt, keyb} = BH2.goMenu(lang, parseInt(type, 10));
        await BH2.edit(id, mId, null, txt, keyb);
        ctx.answerCbQuery(cbqId, {text: messages.stoppedAll(lang)});
      } catch (e) {
        BH2.sendError(e);
      }
    }
    /** @alias addRoute */
    if (data.match(keyboards.actions.addRoute)) {
      // eslint-disable-next-line consistent-return
      await BH2.addRoute(id);
      try {
        const txt = messages.driverStartNewRoute(lang);
        const keyb = keyboards.fr();
        ctx.reply(txt, keyb);
      } catch (e) {
        await BH2.sendError(e);
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
        const txt = messages.start2(lang);
        await BH2.edit(id, mId, null, txt, keyboards.begin(lang));
        ctx.answerCbQuery(cbqId, {text: ''});
      } catch (e) {
        await BH2.sendError(e);
      }
      return;
    }
    /** @alias about */
    if (data.match(keyboards.actions.about)) {
      try {
        const txt = messages.start(lang);
        const keys = [
          [
            {
              text: messages.backJust(lang),
              callback_data: keyboards.actions.startHome,
            },
          ],
        ];
        const keyb = keyboards.inline(lang, keys);
        await BH2.edit(id, mId, null, txt, keyb);
        ctx.answerCbQuery(cbqId, {text: ''});
      } catch (e) {
        showError(e);
        await BH2.sendError(e);
      }
      return;
    }
    /** @alias settings */
    if (data.match(keyboards.actions.settings)) {
      try {
        const [, type] = data.match(/menu_settings([0-9])/);
        const {total = 0} = await BH2.getCounts(id);
        const txt = messages.settingsText(lang);
        const keyb = keyboards.settings(lang, total, type);
        await BH2.edit(id, mId, null, txt, keyb);
        ctx.answerCbQuery(cbqId, {text: ''});
      } catch (e) {
        showError(e);
        await BH2.sendError(e);
      }
      return;
    }
    /** @alias type */
    if (data.match(/type_([0-9])/)) {
      try {
        const [, type] = data.match(/type_([0-9])/);
        await BH2.driverTypeChange(from, type);
        const adm = BH2.isAdmin(id);
        const {txt, keyb} = BH2.goMenu(lang, parseInt(type, 10), adm);
        await BH2.edit(id, mId, null, txt, keyb);
        ctx.answerCbQuery(cbqId, {text: messages.account(lang)});
      } catch (e) {
        showError(e);
        await BH2.sendError(e);
      }
    }
    /** @alias page */
    if (data.match(/page_([0-9]+)/)) {
      try {
        const [, pageStr, isAdm] = data.match(/page_([0-9]+)(.*?)$/);
        const page = parseInt(pageStr, 10);
        const adm = isAdm === '_a' && BH2.isAdmin(id);
        const {cnt, routes = []} = await BH2.myRoutes(id, page, adm);
        const names = getPagiRoutes(routes, page);
        const pages = getPagi(cnt, BH2.getPpage(adm), page);
        const pagi = [...names, ...pages];
        pagi.push(keyboards.addRoute(lang));
        const back = [
          {
            text: messages.backJust(lang),
            callback_data: keyboards.actions.startHome,
          },
        ];
        pagi.push(back);
        const pagination = keyboards.withHome(lang, pagi, false);
        const txt = messages.routesList(lang);
        await BH2.edit(id, mId, null, txt, pagination);
        ctx.answerCbQuery(cbqId, {text: ''});
      } catch (e) {
        showError(e);
        await BH2.sendError(e);
      }
    }
    /** @alias request */
    if (data.match(/^req_(.*?)/)) {
      try {
        const text = await processSendR(ctx, BH2);
        ctx.answerCbQuery(cbqId, {text});
      } catch (e) {
        showError(e);
        await BH2.sendError(e);
      }
    }
    /** @alias route */
    if (data.match(/^route_(.*?)/)) {
      try {
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
        const adm = BH2.isAdmin(id);
        const filter = adm ? {_id} : {userId: id, _id};
        const route = await BH2.getRoute(filter);
        if (!route) {
          await BH2.goHomeAction(ctx, from, cbqId);
          return;
        }
        const {status, hourA, hourB} = route;
        const editBtn = `${EDIT_}${_id}_${page}_1`;
        const callbacks = [`page_${page}`, editBtn];
        const noTime = Number.isNaN(hourA) || !hourB;
        if (status === 1) {
          callbacks.push(`find_1_${_id}_3`);
          callbacks.push(`find_1_${_id}_0`);
        } else if (noTime) {
          callbacks.push(`${HOUR_A}_${_id}_${page}_start`);
        }
        const keyb = keyboards.detailRoute(lang, callbacks, noTime);
        const view = printRouteOne(route, lang, false, adm);
        await BH2.edit(id, mId, null, view, keyb);
        ctx.answerCbQuery(cbqId, {text});
      } catch (e) {
        showError(e);
        await BH2.sendError(e);
      }
    }
    /** @alias edit */
    if (data.match(/^edit_(.*?)/)) {
      try {
        const [, _id, page, frOneT] = data.match(/edit_(.*?)_([0-9]+)_(.*?)$/);
        let text = '';
        if (frOneT && frOneT.match(newReg(`${hoursReg}$`))) {
          const [, ff, fff] = frOneT.match(newReg(`${hoursReg}$`));
          const v = parseFloat(fff.replace('time_', ''));
          const field = ff === HOUR_A ? 'hourA' : 'hourB';
          await BH2.setFieldRoute(id, _id, v, field);
          text = messages.editTimeOk(lang, true);
        }
        if (frOneT && frOneT.match(newReg(`${distReg}`))) {
          const [, ff, fff] = frOneT.match(newReg(`${distReg}$`));
          const v = parseInt(fff, 10) * 100;
          const field = ff === DIST_A ? 'distA' : 'distB';
          await BH2.setFieldRoute(id, _id, v, field);
          text = messages.editDistOk(lang, true);
        }
        const route = await BH2.getRoute({userId: id, _id});
        if (!route) {
          await BH2.goHomeAction(ctx, from, cbqId);
          return;
        }
        const {status, notify, hourA, hourB} = route;
        const callbacks = getRouteCb(_id, page, status, notify);
        if (typeof hourA !== 'undefined' && typeof hourB !== 'undefined') {
          callbacks.push(`${HOUR_A}_${_id}_${page}_one`);
          callbacks.push(`${HOUR_B}_${_id}_${page}_one`);
        } else {
          callbacks.push(`${HOUR_A}_${_id}_${page}_start`);
        }
        callbacks.push(`del_route_${_id}_${page}_s`);
        callbacks.push(`${DIST_A}_${_id}_${page}`);
        callbacks.push(`${DIST_B}_${_id}_${page}`);
        const keyb = keyboards.editRoute(lang, callbacks, route);
        await BH2.edit(id, mId, null, printRouteOne(route, lang, true), keyb);
        ctx.answerCbQuery(cbqId, {text});
      } catch (e) {
        showError(e);
        await BH2.sendError(e);
      }
    }
    /** @alias edit */
    /** @function edit */
    /** @name hours */
    if (data.match(newReg(hoursReg))) {
      try {
        const [, frP, _id, page, _H] = data.match(
          newReg(`${hoursReg}_([0-9]+)_(.*?)$`),
        );
        let cbPath = `${HOUR_B}_${_id}_${page}`;
        const isFrB = frP === HOUR_B;
        if (isFrB) {
          cbPath = `route_${_id}_${page}`;
        }
        let backCb;
        if (_H === 'one') {
          cbPath = `${EDIT_}${_id}_${page}_${frP}`;
          backCb = `${EDIT_}${_id}_${page}_1`;
        } else {
          backCb = isFrB
            ? `${HOUR_A}_${_id}_${page}_start`
            : `${EDIT_}${_id}_${page}_1`;
        }
        const text = messages.editTimeSuccess(lang, isFrB);
        const back = [{text: messages.backJust(lang), callback_data: backCb}];
        const txt = messages.editTime(lang, isFrB);
        let v;
        if (Number.isFinite(parseInt(_H, 10))) {
          v = parseFloat(_H);
          await BH2.setFieldRoute(id, _id, v, 'hourA');
        }
        const keys = keyboards.editTime(lang, isFrB, cbPath, v);
        const keyb = keyboards.withHome(lang, [back, ...keys]);
        await BH2.edit(id, mId, null, txt, keyb);
        ctx.answerCbQuery(cbqId, {text});
      } catch (e) {
        showError(e);
        await BH2.sendError(e);
      }
    }
    /** @alias status */
    if (data.match(newReg(stReg))) {
      try {
        const [, status, _id, page] = data.match(newReg(`${stReg}_([0-9]+)$`));
        const v = status === ACTI ? 1 : 0;
        const route = await BH2.setStatusRoute(id, _id, v);
        const editBtn = `${EDIT_}${_id}_${page}_1`;
        route.notify = v;
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
        const pop = messages.showStatus(
          stNum,
          lang,
          messages.icon(stNum),
          true,
        );
        ctx.answerCbQuery(cbqId, {text: pop});
      } catch (e) {
        showError(e);
        await BH2.sendError(e);
      }
    }
    /** @alias find */
    if (data.match(/^find_(.*?)/)) {
      let text = '';
      try {
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
          let act = keyboards.actions.sendDriverReq;
          if (type === 3) {
            // offer for same passenger
            text = messages.sendRequest3(lang);
            act = keyboards.actions.sendPassReq;
          }
          const {pointAId, userId, notify} = routes[0];

          if (!notify) {
            text = messages.sendRequestNotify(lang);
            act = keyboards.actions.sendNotify;
          }
          const sendRequest = [
            {
              text,
              callback_data: `req_${pointAId}_${act}_${userId}`,
            },
          ];
          if (sendRequest) {
            preKeys.push(sendRequest);
          }
        }
        const keys = [...preKeys, ...pagi];
        const pagination = keyboards.withHome(lang, keys, false);
        const view = printRouteFound(routes, lang, type);
        await BH2.edit(id, mId, null, view, pagination);
      } catch (e) {
        showError(e);
        text = 'err';
        await BH2.sendError(e);
      }
      ctx.answerCbQuery(cbqId, {text});
    }
    /** @alias distance */
    if (data.match(newReg(distReg))) {
      let text = '';
      try {
        const [, distPoint, _id, page = 1, typ] = data.match(
          newReg(`${distReg}_([0-9]+)(.*?)$`));
        if (typ) {
          const dist = parseInt(typ.replace('_', ''), 10);
          await BH2.setDist(_id, dist);
          const view = messages.deletedRoute(lang);
          await BH2.edit(id, mId, null, view);
          await BH2.goHomeAction(ctx, from, cbqId);
          return;
        }
        const pagi = [];
        pagi.push(keyboards.inlineBtn('700', `${EDIT_}${_id}_${page}_${distPoint}_7`));
        pagi.push(keyboards.inlineBtn('1000', `${EDIT_}${_id}_${page}_${distPoint}_10`));
        pagi.push(keyboards.inlineBtn('1500', `${EDIT_}${_id}_${page}_${distPoint}_15`));
        pagi.push(keyboards.inlineBtn('2000', `${EDIT_}${_id}_${page}_${distPoint}_20`));
        const back = [
          {
            text: messages.backJust(lang),
            callback_data: `${EDIT_}${_id}_${page}_1`,
          },
        ];
        const keys = [[...pagi], back];
        const pagination = keyboards.withHome(lang, keys, false);
        const view = messages.distTxt(lang);
        await BH2.edit(id, mId, null, view, pagination);
      } catch (e) {
        showError(e);
        text = 'err';
        await BH2.sendError(e);
      }
      ctx.answerCbQuery(cbqId, {text});
    }
    /** @alias delete */
    if (data.match(/^del_route_(.*?)/)) {
      let text = '';
      try {
        const [, _id, pag = 1, typ] = data.match(
          /del_route_(.*?)_([0-9]+)_(.*?)$/,
        );
        if (typ === 'y') {
          await BH2.deleteRoute(_id);
          // await BH2.notifyUsersDel(_id);
          const view = messages.deletedRoute(lang);
          await BH2.edit(id, mId, null, view);
          await BH2.goHomeAction(ctx, from, cbqId);
          return;
        }
        const page = parseInt(pag, 10);
        const pagi = [];
        const back = [
          {
            text: messages.backJust(lang),
            callback_data: `${EDIT_}${_id}_${page}_1`,
          },
        ];
        const yes = [
          {
            text: messages.yesRoute(lang),
            callback_data: `del_route_${_id}_${page}_y`,
          },
        ];
        const no = [
          {
            text: messages.no(lang),
            callback_data: `${EDIT_}${_id}_${page}_1`,
          },
        ];
        pagi.push(no);
        pagi.push(yes);
        pagi.push(back);
        const keys = [...pagi];
        const pagination = keyboards.withHome(lang, keys, false);
        const view = messages.confirmDeletion(lang);
        await BH2.edit(id, mId, null, view, pagination);
      } catch (e) {
        showError(e);
        text = 'err';
        await BH2.sendError(e);
      }
      ctx.answerCbQuery(cbqId, {text});
    }
  });

  // eslint-disable-next-line consistent-return
  /** @alias processMessage */
  function test(ctx) {
    if (checkAdmin(ctx)) {
      return;
    }
    if (ctx.message.text?.match(/^\/cconfig/)) {
      BH2.cconfig(ctx);
      return;
    }
    if (ctx.message.text?.match(/^\/clearreq/)) {
      BH2.clearReq(ctx);
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
          BH2.sendError(e);
        }
      }
      if (rplMess) {
        try {
          const {from} = ctx.update.message;
          const {language_code: lang} = from;
          if (rplMess.text.match(messages.check(lang))) {
            // Send the name of your route
            BH2.nextProcessName(ctx);
          }
        } catch (e) {
          showError(e);
          BH2.sendError(e);
        }
      }
    }
  }

  bot.on('message', ctx => test(ctx));
  try {
    setTimeout(() => {
      rabbitmq.run(BH2.jobMessage);
      rabbitmq.runSecond(BH2.jobMessage);
    }, 5000);
  } catch (e) {
    botHelper.sendError(e);
  }
};

module.exports = format;
