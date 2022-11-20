const _ = require('lodash');
const mongoose = require('mongoose');
const router = require('express').Router();

const Route = mongoose.model('Route');

const passport = require('passport');

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
    const filter = {
      userId: req.user.toJSON().userId,
    };
    const {range = '[0,5]', filter: F} = req.query;
    const F2 = JSON.parse(F);
    const [skip, limit] = JSON.parse(range);
    const limit2 = limit + 1 - skip;
    const opts = {limit: limit2, skip};
    if (F.match('point":true')) {
      filter.pointA = {$exists: true};
      filter.pointB = {$exists: true};
    }
    if (F2.q) {
      filter.name = new RegExp(F2.q);
    }
    const countTotal = await Route.count(filter);
    Route.find(filter, 'id name createdAt', opts).then(r =>
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
    const newRoute = new Route(req.body);
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
    const update = _.pick(req.body, ['name', 'pointA', 'pointB']);
    try {
      Route.updateOne(filter, update).then(() => {
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
