const _ = require('lodash');
const mongoose = require('mongoose');
const router = require('express').Router();

const passport = require('passport');
const BotHelper = require('../api/routes/bot/route');

const Route = mongoose.model('Route');
const botHelper = new BotHelper();

// search
router.get(
  '/:id',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    const {userId} = req.user.toJSON();
    const {range = '[0,5]', filter: F} = req.query;
    const F2 = JSON.parse(F);

    const [skip, limit] = JSON.parse(range);
    const limit2 = limit + 1 - skip;

    botHelper.findRoutes(userId, skip, F2.id[0]).then(({cnt, routes = []}) => {
      res
        .set('Content-Range', `items ${skip}-${limit2}/${cnt}`)
        .status(200)
        .json(
          routes.map(r => {
            // eslint-disable-next-line no-param-reassign
            r.id = r._id;
            return r;
          }),
        );
    });
  },
);
router.get(
  '/',
  passport.authenticate('jwt', {session: false}),
  async (req, res) => {
    const {userId} = req.user.toJSON();
    const {range = '[0,5]', filter: F} = req.query;
    const F2 = JSON.parse(F);

    const [skip, limit] = JSON.parse(range);
    const limit2 = limit + 1 - skip;

    const filter = {
      userId,
      status: 1,
      ..._.pick(F2, ['name']),
    };

    const opts = {limit: limit2, skip};
    filter.pointA = {$exists: true};
    filter.pointB = {$exists: true};
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

module.exports = router;
