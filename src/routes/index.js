const passport = require('passport');
const router = require('express').Router();

router.use('/users', require('./users'));

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
