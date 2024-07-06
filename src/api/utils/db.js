const mongoose = require('mongoose');
require('../../models/any');

const Any = mongoose.model('Any');

const USERS = process.env.MONGO_COLL_USERS || 'users';
const ROUTES = process.env.MONGO_COLL_ROUTES || 'routes';
const REQUESTS = process.env.MONGO_COLL_REQ || 'requests';
const ROUTES_B = process.env.MONGO_COLL_ROUTES_B || 'routes_bs';
const CONFIGS = process.env.MONGO_COLL_CONGIFS_B || 'configs';

global.connCbTest = () => {
  const col = Any.collection.conn.model(CONFIGS, Any.schema);
  col.find({glob: 'glob'}).then(rows => {
    // eslint-disable-next-line no-restricted-syntax
    for (const row of rows) {
      const oo = Object.keys(row);
      // eslint-disable-next-line array-callback-return,no-loop-func
      oo.map(kk => {
        if (kk.match('_RU|_EN')) {
          // eslint-disable-next-line no-undef
          globalSUPPLINKS[kk] = row[kk];
        }
      });
    }
  });
};

const collsSystem = [REQUESTS, CONFIGS];

const usersCol = Any.collection.conn.model(USERS, Any.schema);
const routesCol = Any.collection.conn.model(ROUTES, Any.schema);
const routesBCol = Any.collection.conn.model(ROUTES_B, Any.schema);

const DIR_A = 'pointA';
const DIR_B = 'pointB';

const constants = {
  MAX_POINT_A_CNT: 50,
  TYPE_PASS: 3,
};

const stat = filter => routesCol.countDocuments(filter);
const groupUsers = field =>
  usersCol.aggregate([
    {
      $group: {
        _id: `${field}`,
        cnt: {$sum: 1},
      },
    },
    {
      $sort: {
        cnt: -1,
      },
    },
  ]);

const statAllLang = async () => {
  const u2 = await groupUsers('$language_code');
  let txt = '';
  if (u2 && Array.isArray(u2)) {
    u2.forEach(i => {
      txt += `\n${i._id} ${i.cnt}`;
    });
  }
  return txt;
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
  if (id && typeof id === 'string') {
    // eslint-disable-next-line no-param-reassign
    id = +id;
  }
  // check from old DB without insert
  const me = await getFromCollection({userId: id}, usersCol, false, project);
  // if (!me) {
  //   me = await getFromCollection({userId: id}, links);
  // }
  return me || {};
};
const updateRoutes = async u => {
  const {id, type} = u;
  // eslint-disable-next-line no-param-reassign
  await routesCol.updateMany({userId: id, type: {$ne: type}}, {type});
  await routesBCol.updateMany({userId: id, type: {$ne: type}}, {type});
};
const updateUser = async (u, collection = usersCol) => {
  const {id, ...user} = u;
  // eslint-disable-next-line no-param-reassign
  await collection.updateOne({userId: id}, user, {upsert: true});
  return (await getFromCollection({userId: id}, collection, false)) || {};
};

const setField = async (filter, field, data, collection = routesCol) => {
  // eslint-disable-next-line no-param-reassign
  await collection.updateOne(filter, {[field]: data}, {upsert: true});
};

const addRouteAFirst = async (data, loc, name = '') =>
  addRouteA(data, loc, DIR_A, name);
const addRouteA = async (data, loc, dir = DIR_A, name = '') => {
  const saveRoute = {...data};
  saveRoute[dir] = loc;
  const {userId} = data;
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
  return res._id;
};

const addRouteB = (data, loc, name) => addRouteA(data, loc, DIR_B, name);

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
  const res = await collection
    .findOneAndUpdate(filter, route, {
      upsert: true,
      new: true,
    })
    .catch(() => {
      throw new Error('bounds');
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

const stopAll = userId => routesCol.updateMany({userId}, {status: 0});
const routesCnt = f => stat(f);
const coord = (route, dir = DIR_A) => route[dir].coordinates;

const getNear = (route, dir = DIR_A) => {
  let dist = route.distA;
  if (dir === DIR_B) {
    dist = route.distB;
  }
  return {
    $geoNear: {
      near: {
        type: 'Point',
        coordinates: coord(route, dir),
      },
      distanceField: 'dist.calculated',
      maxDistance: dist || 900,
      query: {category: 'Routes'},
      spherical: true,
    },
  };
};

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
  if (!route.pointA || !route.pointB) {
    return {cnt: 0, routes: []};
  }
  const $match = {
    userId: {$ne: route.userId},
    status: 1,
    hourA: {$exists: true},
    hourB: {$exists: true},
  };
  const {TYPE_PASS: t3} = constants;
  if (type === 0 || type === t3) {
    if (type === t3) {
      $match.type = type;
    } else {
      $match.type = {$in: [1, 2]};
    }
  }
  const $aMatch = {...$match};
  $aMatch.hourA = {$gte: route.hourA - 2};
  $aMatch.pointA = {$exists: true};

  if ($project && $project.userId) {
    $aMatch.notify = 1;
  }
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
    const pointBMatch = {
      ...$match,
      pointB: {$exists: true},
      pointAId: {$in: pointAIds},
    };
    pointBMatch.hourB = {$gte: route.hourB - 2};
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

const getRoutes = (filter, pageP, perPage) => {
  const page = parseInt(pageP, 10) || 1;
  const limit = parseInt(perPage, 10) || 5;
  const startIndex = (page - 1) * limit;
  return routesCol.find(filter).skip(startIndex).limit(limit);
};
const getRoute = (filter, project = null) =>
  getFromCollection(filter, routesCol, false, project);

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

async function deleteMany(filter, collId) {
  if (!collId || !collsSystem[collId]) {
    // eslint-disable-next-line no-throw-literal
    throw 'not found col';
  }
  const col = Any.collection.conn.model(collsSystem[collId], Any.schema);
  await col.deleteMany(filter);
}

function updateConfig(data, collId = '1') {
  if (!collId || !collsSystem[collId]) {
    // eslint-disable-next-line no-throw-literal
    throw 'not found col';
  }
  const col = Any.collection.conn.model(collsSystem[collId], Any.schema);
  return col.updateOne({glob: 'glob'}, data, {upsert: true});
}

module.exports.DIR_A = DIR_A;
module.exports.DIR_B = DIR_B;

module.exports.stat = stat;
module.exports.updateOne = updateOne;
module.exports.GetUser = GetUser;

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
module.exports.deleteRoute = deleteRoute;
module.exports.updateRoutes = updateRoutes;
module.exports.deleteMany = deleteMany;
module.exports.updateConfig = updateConfig;
module.exports.statAllLang = statAllLang;
module.exports.setField = setField;
module.exports.addRouteAFirst = addRouteAFirst;
module.exports.getFromCollection = getFromCollection;
