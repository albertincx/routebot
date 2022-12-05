const co = require('co');
const mongoose = require('mongoose');

const {showError} = require('./index');
const db = require('./db');

const Any = mongoose.model('Any');
const SUBS = process.env.MONGO_COLL_SUBS || 'subscriptions';
const USERS = process.env.MONGO_COLL_USERS || 'users';
const ROUTES = process.env.MONGO_COLL_ROUTES || 'routes';
const REQUESTS = process.env.MONGO_COLL_REQ || 'requests';

const usersCol = Any.collection.conn.model(USERS, Any.schema);
const routesCol = Any.collection.conn.model(ROUTES, Any.schema);
const reqCol = Any.collection.conn.model(REQUESTS, Any.schema);
const connectDb = () =>
  mongoose.createConnection(process.env.MONGO_URI_SECOND, {
    keepAlive: 1,
    connectTimeoutMS: 30000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
const connectDb2 = () =>
  mongoose.createConnection(process.env.MONGO_URI23, {
    keepAlive: 1,
    connectTimeoutMS: 30000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

const subsCol = Any.collection.conn.model(SUBS, Any.schema);

const processRows = async (cc, limit, timeout, cb) => {
  let items = [];
  if (!cb) {
    return;
  }
  // eslint-disable-next-line func-names
  await co(function* () {
    for (let doc = yield cc.next(); doc != null; doc = yield cc.next()) {
      const item = doc.toObject();
      if (items.length === limit) {
        try {
          yield cb(items);
        } catch (e) {
          showError(e);
        }
        items = [];
        if (timeout) {
          // eslint-disable-next-line no-promise-executor-return
          yield new Promise(resolve => setTimeout(() => resolve(), timeout));
        }
      }
      items.push(item);
    }
  });
  if (items.length) {
    try {
      await cb(items);
    } catch (e) {
      showError(e);
    }
  }
};

const getCids = txt => {
  let l = txt.match(/r_c_id_([0-9_-]+)/);
  if (l && l[1]) {
    l = l[1].split('_').map(Number);
  }
  return l || [];
};

const createBroadcast = async (ctx, txt) => {
  const [cId] = getCids(txt);
  if (!cId) {
    return ctx.reply('broad completed no id');
  }
  const connSecond = connectDb2();
  const messCol = Any.collection.conn.model('messages', Any.schema);
  const model = connSecond.model('broadcasts', Any.schema);
  const filter = {};
  if (process.env.DEV) {
    // filter.username = {$in: ['safiullin']};
  }
  // await model.updateMany(
  //   {cId: 10, error: /:429/},
  //   {$unset: {sent: '', error: ''}},
  // );
  /* await model.updateMany({ cId: 10, code: 403 },
    { $unset: { sent: '', error: '', code:'' } }); */
  const cursor = messCol.find(filter).cursor();
  await processRows(cursor, 500, 10, items => {
    const updates = [];
    items.forEach(({id}) => {
      updates.push({
        updateOne: {
          filter: {id, cId, sent: {$exists: false}},
          update: {id, cId},
          upsert: true,
        },
      });
    });
    return updates.length ? model.bulkWrite(updates) : null;
  });
  ctx.reply('broad completed');
  return connSecond.close();
};
const startBroadcast = async (ctx, txtParam, bot) => {
  const [cId, Mid, FromId, isChannel, SecondMid] = getCids(txtParam);
  if (!cId) {
    return ctx.reply('broad completed no id');
  }
  const result = {err: 0, success: 0};
  let model;
  let connSecond;

  if (process.env.DEV) {
    connSecond = connectDb();
    model = connSecond.model('broadcasts', Any.schema);
  } else {
    model = Any.collection.conn.model('broadcasts', Any.schema);
  }

  const filter = {sent: {$exists: false}, cId};
  const sendCmd = Mid ? 'forward' : 'sendAdmin';
  const cursor = model.find(filter).limit(800).cursor();
  let breakProcess = false;
  await processRows(cursor, 5, 500, async items => {
    if (breakProcess) {
      return;
    }
    const success = [];
    try {
      for (let i = 0; i < items.length; i += 1) {
        if (breakProcess) {
          break;
        }
        const {_id, id} = items[i];
        let runCmd;
        if (Mid) {
          runCmd = () => bot[sendCmd](Mid, FromId * (isChannel ? -1 : 1), id);
        } else {
          runCmd = () =>
            bot[sendCmd](txtParam.replace(/(\s|_)?r_c_id_(.*?)\s/, ''), id);
        }
        try {
          // eslint-disable-next-line no-await-in-loop
          await runCmd();
          if (SecondMid) {
            const runCmd2 = () =>
              bot[sendCmd](SecondMid, FromId * (isChannel ? -1 : 1), id);
            // eslint-disable-next-line no-await-in-loop
            await runCmd2();
          }
          success.push({
            updateOne: {
              filter: {_id},
              update: {sent: true},
            },
          });
          result.success += 1;
        } catch (e) {
          if (e.code === 429) {
            breakProcess = JSON.stringify(e);
          }
          result.err += 1;
          success.push({
            updateOne: {
              filter: {_id},
              update: {
                sent: true,
                error: JSON.stringify(e),
                code: e.code,
              },
            },
          });
        }
      }
    } catch (e) {
      if (
        e.code === 429 &&
        e.response.parameters &&
        e.response.parameters.retry_after
      ) {
        // await timeout(e.response.parameters.retry_after);
      }
      if (e.code === 429) {
        breakProcess = JSON.stringify(e);
      }
    }
    if (success.length) {
      await model.bulkWrite(success);
    }
  });
  const r = `${JSON.stringify(result)}`;
  if (connSecond) {
    await connSecond.close();
  }
  return ctx.reply(`broad completed: ${r} with ${breakProcess || ''}`);
};

const addSubscription = async (d, collection = subsCol) => {
  const filter = {from: d.from, routeId: d.routeId};
  return collection.findOneAndUpdate(filter, d, {
    upsert: true,
    new: true,
  });
};
const subscribers = async (_id, cb) => {
  const filter = {routeId: _id};
  const cursor = subsCol.find(filter).cursor();
  await processRows(cursor, 500, 10, cb);
};

const getRequest = async (reqData, n, project = '_id') => {
  const coll = !n ? reqCol : subsCol;
  const r = await db.getFromCollection(reqData, coll, false, project);
  if (!r) {
    await setRequest(reqData);
  }
  return r;
};

const setRequest = async (reqData, collection = reqCol) => {
  // eslint-disable-next-line no-param-reassign
  await collection.updateOne(reqData, reqData, {upsert: true});
};
const statAll = async () => {
  const c = await routesCol.countDocuments({});
  const ca = await routesCol.countDocuments({status: 1});
  const u = await usersCol.countDocuments({});
  const r = await reqCol.countDocuments({});
  return {
    all: c,
    active: ca,
    users: u,
    req: r,
  };
};
module.exports.createBroadcast = createBroadcast;
module.exports.startBroadcast = startBroadcast;
module.exports.subscribers = subscribers;
module.exports.addSubscription = addSubscription;
module.exports.getRequest = getRequest;
module.exports.statAll = statAll;
