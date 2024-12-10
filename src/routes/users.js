const mongoose = require('mongoose');
const router = require('express')
  .Router();

const User = mongoose.model('User');
const db = require('../api/utils/db');

// Validate an existing user and issue a JWT
router.post('/settings', async (req, res, next) => {
  let u = req.user;
  const user = await User.findOne({username: u.username})
    .catch(err => {
      next(err);
    });
  if (!user) {
    res.status(401)
      .json({success: false, msg: 'could not find user'});
    return;
  }
  res.status(200)
    .json({
      success: true,
    });
});

module.exports = router;
