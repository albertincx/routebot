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
const usersCol = Any.collection.conn.model(USERS, Any.schema);
const routesCol = Any.collection.conn.model(ROUTES, Any.schema);
const DIR_A = 'pointA';
const DIR_B = 'pointB';

const stat = filter => routesCol.countDocuments(filter);

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

const updateOne = (userId, collection = usersCol) => {
  const item = {$unset: {routes: 1}};
  item.$inc = {total: 1};
  // eslint-disable-next-line no-param-reassign
  return collection.updateOne({userId}, item);
};

const getFromCollection = async (filter, coll, insert = true, proj = null) => {
  const me = await coll.findOne(filter, proj);
  if (insert || me) {
    // await updateOne(filter, coll);
  }
  return me ? me.toObject() : null;
};

const clearRoutes = async id => {
  await routesCol.deleteMany({
    userId: id,
    $or: [{pointB: {$exists: false}}, {pointA: {$exists: false}}],
  });
  const total = await routesCol.countDocuments({
    userId: id,
    pointA: {$exists: true},
    pointB: {$exists: true},
  });
  const upd = {total};
  const $unset = {name: 1};
  if (total) {
    upd.routes = 3;
  } else {
    $unset.routes = 1;
  }
  await usersCol.updateOne({userId: id}, {...upd, $unset});
};

const GetUser = async (id, project = null) => {
  // check from old DB without insert
  const me = await getFromCollection({userId: id}, usersCol, false, project);
  // if (!me) {
  //   me = await getFromCollection({userId: id}, links);
  // }
  return me || {};
};

const updateUser = async (u, collection = usersCol) => {
  const {id, ...user} = u;
  // eslint-disable-next-line no-param-reassign
  await collection.updateOne({userId: id}, user, {upsert: true});
  return (await getFromCollection({userId: id}, collection, false)) || {};
};

const addRouteA = async (data, loc, dir = DIR_A) => {
  const saveRoute = {...data};
  saveRoute[dir] = loc;
  const {userId} = data;
  const u = await GetUser(userId, 'name');
  const {name} = u;
  const routes = dir === DIR_B ? 3 : 2;
  await addRoute({userId, name}, saveRoute, routes);
};
const addRoute = async (filter, route, routes = undefined) => {
  if (!routes) {
    // eslint-disable-next-line no-param-reassign
    filter.name = route.name;
  }
  await routesCol.updateOne(filter, route, {upsert: true});
  const upd = {};
  if (!routes) {
    upd.routes = 1;
    upd.name = route.name;
  } else {
    upd.routes = routes;
  }
  await usersCol.updateOne({userId: filter.userId}, upd, {upsert: true});
};
const addRouteB = (userId, loc) => addRouteA(userId, loc, DIR_B);
const stopAll = userId => routesCol.updateMany({userId}, {status: 0});
const routesCnt = userId => stat({userId});

const findRoutes = (route, skip, limit) => {
  const aggr = routesCol.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [
            route.pointA.coordinates[0],
            route.pointA.coordinates[1],
          ],
        },
        distanceField: 'dist.calculated',
        maxDistance: 400,
        query: {category: 'Routes'},
        includeLocs: 'dist.pointA',
        spherical: true,
      },
    },
    {$match: {userId: {$ne: route.userId}}},
    {$sort: {'dist.calculated': -1}},
    {
      $facet: {
        metadata: [{$count: 'total'}],
        data: [{$skip: skip}, {$limit: limit}], // add projection here wish you re-shape the docs
      },
    },
  ]);
  console.log(JSON.stringify(aggr));
  return aggr;
};

const getRoutes = (userId, pageP, perPage, near = false) => {
  const page = parseInt(pageP, 10) || 1;
  const limit = parseInt(perPage, 10) || 5;
  const startIndex = (page - 1) * limit;
  if (near) {
    return findRoutes(userId, startIndex, limit);
  }
  return routesCol.find({userId}).skip(startIndex).limit(limit);
};
const getRoute = (userId, _id) =>
  getFromCollection({userId, _id}, routesCol, false);

const getActiveCnt = userId =>
  routesCol.countDocuments({userId, status: {$ne: 0}});

const statusRoute = (userId, _id, update) =>
  routesCol.updateOne({userId, _id}, update);

module.exports.stat = stat;
module.exports.updateOne = updateOne;
module.exports.GetUser = GetUser;
module.exports.createBroadcast = createBroadcast;
module.exports.startBroadcast = startBroadcast;
module.exports.processBroadcast = processBroadcast;
module.exports.updateUser = updateUser;
module.exports.addRoute = addRoute;
module.exports.addRouteA = addRouteA;
module.exports.addRouteB = addRouteB;
module.exports.clearRoutes = clearRoutes;
module.exports.stopAll = stopAll;
module.exports.getActiveCnt = getActiveCnt;
module.exports.routesCnt = routesCnt;
module.exports.getRoutes = getRoutes;
module.exports.statusRoute = statusRoute;
module.exports.getRoute = getRoute;
