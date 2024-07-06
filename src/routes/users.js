const mongoose = require('mongoose');
const router = require('express')
  .Router();

const User = mongoose.model('User');
const db = require('../api/utils/db');

// Validate an existing user and issue a JWT
router.post('/login', (req, res, next) => {
  let u = req.user;
  User.findOne({username: u.username})
    .then(async user => {
      if (!user) {
        await db.updateUser(u);
        user = u;
      }
      if (!user) {
        res.status(401)
          .json({success: false, msg: 'could not find user'});
        return;
      }
      res.status(200)
        .json({
          success: true,
        });
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
