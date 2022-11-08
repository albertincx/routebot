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
    Route.find(filter).then(r => res.status(200).json(r[0]));
  },
);
router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
  const filter = {
    userId: req.user.toJSON().userId,
  };
  Route.find(filter, 'id name createdAt').then(r =>
    res.set('Content-Range', `items 0-5/${r.length}`).status(200).json(r),
  );
});

router.post(
  '/',
  passport.authenticate('jwt', {session: false}),
  // eslint-disable-next-line consistent-return
  async (req, res) => {
    const {userId} = req.user.toJSON();
    const filter = {name: req.body.name, userId};
    const exists = await Route.findOne(filter, '_id');
    if (exists) {
      return res.status(403).json({
        success: false,
        message: 'route with this name is already exists',
      });
    }
    const newUser = new Route(req.body);
    newUser.userId = userId;
    try {
      newUser.save().then(user => {
        res.json(user);
      });
    } catch (err) {
      res.json({success: false, msg: err});
    }
  },
);

router.put(
  '/:id',
  passport.authenticate('jwt', {session: false}),
  // eslint-disable-next-line consistent-return
  async (req, res) => {
    const {userId} = req.user.toJSON();
    const {_id} = req.body;
    const filterExists = {name: req.body.name, userId};
    const exists = await Route.findOne(filterExists, '_id');
    if (exists) {
      return res.status(403).json({
        success: false,
        message: 'route with this name is already exists',
      });
    }
    const filter = {_id, userId};
    const update = _.pick(req.body, ['name']);
    try {
      Route.updateOne(filter, update).then(() => {
        res.json({...update, id: _id});
      });
    } catch (err) {
      res.json({success: false, msg: err});
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
