const passport = require('passport');
const router = require('express').Router();
require('../models/route');

router.use('/users', require('./users'));
router.use('/routes', require('./routes'));

router.get(
  '/reviews',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    res.status(200).json({
      success: true,
      msg: 'You are successfully authenticated to this route!',
    });
  },
);

module.exports = router;
