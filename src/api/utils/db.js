const co = require('co');
const mongoose = require('mongoose');

const anySchema = new mongoose.Schema(
  {},
  {
    timestamps: {createdAt: true, updatedAt: false},
    strict: false,
  },
);

anySchema.method({
  transform() {
    return this.toObject();
  },
});
const Any = mongoose.model('Any', anySchema);

const USERS = process.env.MONGO_COLL_LINKS || 'users';
const ROUTES = process.env.MONGO_COLL_LINKS || 'routes';
const LINKS_COLL = process.env.MONGO_COLL_LINKS || 'links';
const ILINKS_COLL = process.env.MONGO_COLL_ILINKS || 'ilinks';

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
const links = Any.collection.conn.model(LINKS_COLL, Any.schema);
const usersCol = Any.collection.conn.model(USERS, Any.schema);
const routesCol = Any.collection.conn.model(ROUTES, Any.schema);
const inlineLinks = Any.collection.conn.model(ILINKS_COLL, Any.schema);

const stat = () => links.countDocuments();

const processRows = async (cc, limit = 25, timeout, cb) => {
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
          // eslint-disable-next-line no-console
          console.log(e);
        }
        items = [];
        if (timeout) {
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
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }
};

const cBroad = '/createBroadcast';
const sBroad = '/startBroadcast';

const processBroadcast = async (txtParam, ctx, botHelper) => {
  let txt = txtParam;
  if (txt.match(cBroad)) {
    ctx.reply('broad new started');
    return createBroadcast(ctx, txt);
  }
  if (txt.match(sBroad)) {
    txt = txt.replace(sBroad, '');
    ctx.reply('broad send started');
    return startBroadcast(ctx, txt, botHelper);
  }
  return Promise.resolve();
};

const getCids = txt => {
  let l = txt.match(/r_c_id_([0-9_-]+)/);
  if (l && l[1]) l = l[1].split('_').map(Number);
  return l || [];
};

const createBroadcast = async (ctx, txt) => {
  const [cId] = getCids(txt);
  if (!cId) {
    return ctx.reply('broad completed no id');
  }
  const connSecond = connectDb2();
  const messages = Any.collection.conn.model('messages', Any.schema);
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
  const cursor = messages.find(filter).cursor();
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

const clear = async msg => {
  let search = msg.text.replace('/cleardb', '').trim();
  search = `${search}`.trim();
  if (!search) {
    return Promise.resolve('empty');
  }
  const s = new RegExp(`^https?://${search}`);
  const d = await links.deleteMany({url: s});
  return JSON.stringify(d);
};

const removeInline = url => inlineLinks.deleteMany({url});

const updateOne = (item, collection = links) => {
  const {url} = item;
  // eslint-disable-next-line no-param-reassign
  return collection.updateOne({url}, item, {upsert: true});
};

const getFromCollection = async (id, coll, insert = true) => {
  const me = await coll.findOne({userId: id});
  if (insert || me) {
    await updateOne({userId: id}, coll);
  }
  return me.toObject();
};

const clearName = async id => {
  await usersCol.updateOne({userId: id}, {name: ''});
};

const GetUser = async id => {
  // check from old DB without insert
  let me = await getFromCollection(id, usersCol, false);
  if (!me) {
    me = await getFromCollection(id, links);
  }
  return me || {};
};

const updateUser = async (u, collection = usersCol) => {
  const {id, ...user} = u;
  // eslint-disable-next-line no-param-reassign
  await collection.updateOne({userId: id}, user, {upsert: true});
  return getFromCollection(id, collection, false) || {};
};

const addRouteA = async (
  userId,
  loc,
  dir = 'pointA',
  collection = routesCol,
) => {
  const name = await usersCol.findOne({userId}, 'name');
  await collection.updateOne({userId, name}, {[dir]: loc}, {upsert: true});
};
const addRoute = async (uid, name, collection = routesCol) => {
  await collection.updateOne({userId: uid}, {name}, {upsert: true});
  await usersCol.updateOne({userId: uid}, {name, routes: 1}, {upsert: true});
};
const addRouteB = (userId, loc) => addRouteA(userId, loc, 'pointB');

module.exports.stat = stat;
module.exports.clear = clear;
module.exports.updateOne = updateOne;
module.exports.removeInline = removeInline;
module.exports.GetUser = GetUser;
module.exports.createBroadcast = createBroadcast;
module.exports.startBroadcast = startBroadcast;
module.exports.processBroadcast = processBroadcast;
module.exports.updateUser = updateUser;
module.exports.addRoute = addRoute;
module.exports.addRouteA = addRouteA;
module.exports.addRouteB = addRouteB;
module.exports.clearName = clearName;
