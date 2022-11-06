const mongoose = require('mongoose');
const router = require('express').Router();
const {createHmac, createHash} = require('node:crypto');

const User = mongoose.model('User');
const passport = require('passport');
const utils = require('../lib/utils');
const db = require('../api/utils/db');

router.get(
  '/protected',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    res.status(200).json({
      success: true,
      msg: 'You are successfully authenticated to this route!',
    });
  },
);

function genChkString(dataCheck) {
  let res = '';
  res += `auth_date=${dataCheck.auth_date}\n`;
  if (dataCheck.first_name != null && dataCheck.first_name.length > 0) {
    res += `first_name=${dataCheck.first_name}\n`;
  }
  res += `id=${dataCheck.id}\n`;
  if (dataCheck.last_name != null && dataCheck.last_name.length > 0) {
    res += `last_name=${dataCheck.last_name}\n`;
  }
  if (dataCheck.photo_url != null && dataCheck.photo_url.length > 0) {
    res += `photo_url=${dataCheck.photo_url}\n`;
  }
  res += `username=${dataCheck.username}`;
  return res;
}

function checkHash(checkStr) {
  // eslint-disable-next-line no-undef
  const key = createHash('sha256').update(process.env.TBTKN).digest();
  // eslint-disable-next-line no-undef
  return createHmac('sha256', key).update(checkStr).digest('hex');
}

// Validate an existing user and issue a JWT
router.post('/login', (req, res, next) => {
  const u = req.body;
  let validTgUser = false;
  if (u.hash) {
    const checkedHash = checkHash(genChkString(u));
    if (!checkedHash || checkedHash !== u.hash) {
      res.status(401).json({success: false, msg: 'could not find user'});
      return;
    }
    validTgUser = true;
  }
  User.findOne({username: u.username})
    .then(async user => {
      if (u.hash && !user) {
        await db.updateUser(u);
        // eslint-disable-next-line no-param-reassign
        user = u;
      }
      if (!user) {
        res.status(401).json({success: false, msg: 'could not find user'});
        return;
      }
      let isValid;
      if (validTgUser) {
        isValid = true;
      } else {
        // Function defined at bottom of app.js
        isValid = utils.validPassword(req.body.password, user.hash, user.salt);
      }
      if (isValid) {
        const tokenObject = utils.issueJWT(user);
        res.status(200).json({
          success: true,
          token: tokenObject.token,
          expiresIn: tokenObject.expires,
        });
      } else {
        res
          .status(401)
          .json({success: false, msg: 'you entered the wrong password'});
      }
    })
    .catch(err => {
      next(err);
    });
});
// Register a new user
router.post('/register', (req, res) => {
  const saltHash = utils.genPassword(req.body.password);

  const {salt} = saltHash;
  const {hash} = saltHash;

  const newUser = new User({username: req.body.username, hash, salt});

  try {
    newUser.save().then(user => {
      res.json({success: true, user});
    });
  } catch (err) {
    res.json({success: false, msg: err});
  }
});

module.exports = router;
