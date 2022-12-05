const _ = require('lodash');
const mongoose = require('mongoose');
const router = require('express').Router();

const Route = mongoose.model('Route');

const passport = require('passport');
const {getPoint} = require('../lib/utils');

const db = require('../api/utils/db');
const {DIR_A, DIR_B} = require('../api/utils/db');
const BotHelper = require('../api/routes/bot/route');

const botHelper = new BotHelper();

// eslint-disable-next-line consistent-return
const getHour = v => {
  const timestamp = Date.parse(v);
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(timestamp) === false) {
    const d = new Date(timestamp);
    return parseFloat(`${d.getHours()}.${d.getMinutes()}`);
  }
};

const getData = body => {
  const update = _.pick(body, ['name', 'pointA', 'pointB']);
  const additionals = _.pick(body, ['hourA', 'hourB', 'status']);
  update.pointA = getPoint(update);
  update.pointB = getPoint(update, 'B');
  if (additionals.hourA) {
    const v = getHour(additionals.hourA);
    if (v) {
      update.hourA = v;
    }
  }
  if (additionals.hourB) {
    const v = getHour(additionals.hourB);
    if (v) {
      update.hourB = v;
    }
  }
  if (typeof additionals.status !== 'undefined') {
    update.status = additionals.status ? 1 : 0;
  }
  return update;
};
router.get(
  '/:id',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    const filter = {
      userId: req.user.toJSON().userId,
      _id: req.params.id,
    };
    Route.find(filter)
      .then(r => res.status(200).json(r[0]))
      .catch(err => {
        res.json({success: false, message: err});
      });
  },
);
router.get(
  '/',
  passport.authenticate('jwt', {session: false}),
  async (req, res) => {
    const {range = '[0,5]', filter: F} = req.query;
    const F2 = JSON.parse(F);

    const filter = {
      userId: req.user.toJSON().userId,
      ..._.pick(F2, ['status', 'name']),
    };
    const [skip, limit] = JSON.parse(range);
    const limit2 = limit + 1 - skip;
    const opts = {limit: limit2, skip};
    if (typeof F2.point !== 'undefined') {
      filter.pointA = {$exists: F2.point};
      filter.pointB = {$exists: F2.point};
    }
    if (filter.name) {
      filter.name = new RegExp(filter.name);
    }
    const countTotal = await Route.count(filter);
    Route.find(filter, 'id name createdAt status hourA hourB', opts).then(r =>
      res
        .set('Content-Range', `items ${skip}-${limit2}/${countTotal}`)
        .status(200)
        .json(r),
    );
  },
);

router.post(
  '/',
  passport.authenticate('jwt', {session: false}),
  // eslint-disable-next-line consistent-return
  async (req, res) => {
    const {userId} = req.user.toJSON();
    const filter = {name: req.body.name, userId};
    const exists = await Route.findOne(filter, '_id');
    if (exists) {
      res.status(403).json({
        success: false,
        message: 'route with this name is already exists',
      });
      return;
    }
    const update = getData(req.body);
    const {
      // eslint-disable-next-line no-unused-vars
      _id: routeId,
      // eslint-disable-next-line no-unused-vars
      id,
      pointA,
      pointB,
      name,
      ...newRoute
    } = new Route(update).toJSON();
    newRoute.userId = userId;
    const routeData = {
      ...newRoute,
      userId,
      category: 'Routes',
      type: newRoute.type || 3,
      status: 0,
    };
    try {
      const {_id: rID} = await db.addRoute({userId}, {name});
      await db.addRouteA(routeData, pointA, DIR_A, name);
      // literally B
      await db.addRouteA(routeData, pointB, DIR_B, name);
      const route = await Route.find({userId, _id: rID.toHexString()});
      res.json(route[0]);
      // res.json({});
    } catch (err) {
      res.json({success: false, message: err});
    }
  },
);

router.put(
  '/:id',
  passport.authenticate('jwt', {session: false}),
  // eslint-disable-next-line consistent-return
  async (req, res) => {
    const {userId} = req.user.toJSON();
    const {id: _id} = req.params;
    const update = getData(req.body);
    try {
      await botHelper.setFieldsRoute(userId, _id, update);
      res.json({...update, id: _id});
    } catch (err) {
      res.json({success: false, message: err});
    }
  },
);

router.delete(
  '/:id',
  passport.authenticate('jwt', {session: false}),
  // eslint-disable-next-line consistent-return
  async (req, res) => {
    const {userId} = req.user.toJSON();
    const filter = {_id: req.params.id, userId};
    const exists = await Route.findOne(filter, '_id');
    if (!exists) {
      res.json({});
      return;
    }
    try {
      await db.deleteRoute(req.params.id);
      res.json({});
    } catch (err) {
      res.json({success: false, msg: err});
    }
  },
);
module.exports = router;
