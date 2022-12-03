const _ = require('lodash');
const mongoose = require('mongoose');
const router = require('express').Router();

const Route = mongoose.model('Route');

const passport = require('passport');
const {getPoint} = require('../lib/utils');

const getHour = v => {
  const timestamp = Date.parse(v);
  if (isNaN(timestamp) === false) {
    const d = new Date(timestamp);
    return parseFloat(`${d.getHours()}.${d.getMinutes()}`);
  }
  return;
};

const getData = body => {
  const update = _.pick(body, ['name', 'pointA', 'pointB']);
  const hours = _.pick(body, ['hourA', 'hourB']);
  update.pointA = getPoint(update);
  update.pointB = getPoint(update, 'B');
  if (hours.hourA) {
    const v = getHour(hours.hourA);
    if (v) {
      update.hourA = v;
    }
  }
  if (hours.hourB) {
    const v = getHour(hours.hourB);
    if (v) {
      update.hourB = v;
    }
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
    Route.find(filter, 'id name createdAt status', opts).then(r =>
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
    const newRoute = new Route(update);
    newRoute.userId = userId;
    // console.log(newRoute);
    newRoute
      .save()
      .then(route => {
        res.json(route);
      })
      .catch(err => {
        res.json({success: false, message: err});
      });
  },
);

router.put(
  '/:id',
  passport.authenticate('jwt', {session: false}),
  // eslint-disable-next-line consistent-return
  async (req, res) => {
    const {userId} = req.user.toJSON();
    const {id: _id} = req.params;
    const filter = {_id, userId};
    const update = getData(req.body);
    try {
      await Route.updateOne(filter, update).then(() => {
        res.json({...update, id: _id});
      });
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
    try {
      Route.deleteOne({...filter}).then(() => {
        res.json({});
      });
    } catch (err) {
      res.json({success: false, msg: err});
    }
  },
);
module.exports = router;
