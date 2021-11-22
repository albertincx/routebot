const co = require('co');
const mongoose = require('mongoose');

const {showError} = require('./index');

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
const SUBS = process.env.MONGO_COLL_SUBS || 'subscriptions';
const REQUESTS = process.env.MONGO_COLL_LINKS || 'requests';
const ROUTES_B = process.env.MONGO_COLL_ROUTES_B || 'routes_bs';

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
const reqCol = Any.collection.conn.model(REQUESTS, Any.schema);
const routesBCol = Any.collection.conn.model(ROUTES_B, Any.schema);
const subsCol = Any.collection.conn.model(SUBS, Any.schema);

const DIR_A = 'pointA';
const DIR_B = 'pointB';

const constants = {
  MAX_POINT_A_CNT: 50,
  TYPE_PASS: 3,
};

const stat = filter => routesCol.countDocuments(filter);

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
  if (l && l[1]) l = l[1].split('_').map(Number);
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
const checkUser = (id, project = 'name') =>
  getFromCollection({userId: id}, usersCol, false, project);

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

const setRequest = async (reqData, collection = reqCol) => {
  // eslint-disable-next-line no-param-reassign
  await collection.updateOne(reqData, reqData, {upsert: true});
};

// eslint-disable-next-line consistent-return
const addRouteA = async (data, loc, dir = DIR_A) => {
  const saveRoute = {...data};
  saveRoute[dir] = loc;
  const {userId} = data;
  const u = await GetUser(userId, 'name');
  const {name} = u;
  const routes = dir === DIR_B ? 3 : 2;
  const res = await addRoute({userId, name}, saveRoute, routes);
  let lastUpdatedId = '';
  if (dir === DIR_B) {
    saveRoute.pointAId = res._id;
    lastUpdatedId = res._id;
    await addRoute({userId, name}, saveRoute, routes, routesBCol);
    const {TYPE_PASS: t3} = constants;
    if (saveRoute.type !== t3) {
      const routeA = await getRoute({userId, _id: res._id}, 'pointA');
      const ro = {...saveRoute, ...routeA};
      const $proj = {userId: 1};
      const {MAX_POINT_A_CNT: l} = constants;
      const {cnt, routes: r} = await findRoutes(ro, 0, l, t3, $proj);
      if (cnt) {
        return {routes: r, lastUpdatedId};
      }
    }
    return {lastUpdatedId};
  }
};

const addRoute = async (
  filter,
  route,
  routes = undefined,
  collection = routesCol,
) => {
  if (!routes) {
    // eslint-disable-next-line no-param-reassign
    filter.name = route.name;
  }
  const res = await collection.findOneAndUpdate(filter, route, {
    upsert: true,
    new: true,
  });
  const upd = {};
  if (!routes) {
    upd.routes = 1;
    upd.name = route.name;
  } else {
    upd.routes = routes;
  }
  await usersCol.updateOne({userId: filter.userId}, upd, {upsert: true});
  return res;
};
const addSubscription = async (d, collection = subsCol) => {
  const filter = {from: d.from, routeId: d.routeId};
  const res = await collection.findOneAndUpdate(filter, d, {
    upsert: true,
    new: true,
  });
  return res;
};

const addRouteB = (userId, loc) => addRouteA(userId, loc, DIR_B);
const stopAll = userId => routesCol.updateMany({userId}, {status: 0});
const routesCnt = userId => stat({userId});
const coord = (route, dir = DIR_A) => route[dir].coordinates;

const getNear = (route, dir = DIR_A) => ({
  $geoNear: {
    near: {
      type: 'Point',
      coordinates: coord(route, dir),
    },
    distanceField: 'dist.calculated',
    maxDistance: 400,
    query: {category: 'Routes'},
    spherical: true,
  },
});

const getPipeline = (
  route,
  $match,
  skip,
  limit,
  dir = DIR_A,
  $project = {_id: 1},
) => [
  {...getNear(route, dir)},
  {$match},
  {$project},
  {$sort: {'dist.calculated': -1}},
  {
    $facet: {
      metadata: [{$count: 'total'}],
      data: [{$skip: skip}, {$limit: limit}], // add projection here wish you re-shape the docs
    },
  },
];

const findRoutes = async (route, skip, limit, type = 4, $project = null) => {
  const $match = {userId: {$ne: route.userId}, status: 1};
  const {TYPE_PASS: t3} = constants;
  if (type === 0 || type === t3) {
    if (type === t3) {
      $match.type = type;
    } else {
      $match.type = {$in: [1, 2]};
    }
  }
  const $aMatch = {...$match};
  $aMatch.hourA = {$gte: route.hourA};
  if ($project && $project.userId) {
    $aMatch.notify = 1;
  }
  // console.log($aMatch);
  const {MAX_POINT_A_CNT: l} = constants;
  const pipeline = getPipeline(route, $aMatch, 0, l);
  const aggr = await routesCol.aggregate(pipeline);
  const pointAIds = [];
  if (aggr[0]) {
    const {data} = aggr[0];
    data.forEach(r => pointAIds.push(r._id));
    // console.log(JSON.stringify(pipeline, null, 4));
    // console.log(JSON.stringify(aggr, null, 4));
  }
  let aggrB = [];
  if (pointAIds.length) {
    const pointBMatch = {...$match, pointAId: {$in: pointAIds}};
    pointBMatch.hourB = {$gte: route.hourB};
    const pipelineB = getPipeline(route, pointBMatch, skip, limit, DIR_B, {
      name: 1,
      pointAId: 1,
      type: 1,
      hourA: 1,
      hourB: 1,
      notify: 1,
      userId: 1,
      ...($project || {}),
    });
    aggrB = await routesBCol.aggregate(pipelineB);
    // console.log(JSON.stringify(pipelineB, null, 4));
    // console.log(JSON.stringify(aggrB, null, 4));
  }
  let r;
  let cnt;
  if (aggrB && aggrB[0]) {
    const {data, metadata = []} = aggrB[0];
    r = data;
    cnt = (metadata[0] && metadata[0].total) || 0;
  }
  return {cnt, routes: r};
};

const getRoutesNear = (route, pageP, type, perPage = 1) => {
  const page = parseInt(pageP, 10) || 1;
  const limit = parseInt(perPage, 10) || 5;
  const startIndex = (page - 1) * limit;
  return findRoutes(route, startIndex, limit, type);
};

const getRoutes = (userId, pageP, perPage) => {
  const page = parseInt(pageP, 10) || 1;
  const limit = parseInt(perPage, 10) || 5;
  const startIndex = (page - 1) * limit;
  return routesCol.find({userId}).skip(startIndex).limit(limit);
};
const subscribers = async (_id, cb) => {
  const filter = {routeId: _id};
  const cursor = subsCol.find(filter).cursor();
  await processRows(cursor, 500, 10, cb);
};
const getRoute = (filter, project = null) =>
  getFromCollection(filter, routesCol, false, project);

const getRequest = async (reqData, n, project = '_id') => {
  const coll = !n ? reqCol : subsCol;
  const r = await getFromCollection(reqData, coll, false, project);
  if (!r) {
    await setRequest(reqData);
  }
  return r;
};

const getActiveCnt = userId =>
  routesCol.countDocuments({userId, status: {$ne: 0}});

const statusRoute = async (userId, _id, update) => {
  await routesCol.updateOne({userId, _id}, update);
  return routesBCol.updateOne(
    {userId, pointAId: mongoose.Types.ObjectId(_id)},
    update,
  );
};

async function deleteRoute(_id) {
  await routesCol.deleteOne({_id});
  return routesBCol.deleteOne({pointAId: mongoose.Types.ObjectId(_id)});
}

module.exports.stat = stat;
module.exports.updateOne = updateOne;
module.exports.GetUser = GetUser;
module.exports.createBroadcast = createBroadcast;
module.exports.startBroadcast = startBroadcast;
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
module.exports.checkUser = checkUser;
module.exports.getRoutesNear = getRoutesNear;
module.exports.getRequest = getRequest;
module.exports.deleteRoute = deleteRoute;
module.exports.subscribers = subscribers;
module.exports.addSubscription = addSubscription;
