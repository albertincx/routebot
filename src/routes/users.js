const mongoose = require('mongoose');
const router = require('express').Router();
const {createHmac, createHash} = require('node:crypto');

const User = mongoose.model('User');
const utils = require('../lib/utils');
const db = require('../api/utils/db');
const {validateTmaAuth} = require('../lib/tma_auth');

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
const TG_ADMIN = parseInt(process.env.TGADMIN, 10);

// Validate an existing user and issue a JWT
router.post('/login', (req, res, next) => {
  let u = req.body;
  let validTgUser = false;
  let hasHash = u.hash;
  if (hasHash) {
    const checkedHash = checkHash(genChkString(u));
    if (!checkedHash || checkedHash !== u.hash) {
      res.status(401).json({success: false, msg: 'could not find user'});
      return;
    }
    validTgUser = true;
  } else if (u.query) {
    validTgUser = validateTmaAuth(u);
    try {
      const uu = JSON.parse(
        new URL(`https://test/?${u.query}`).searchParams.get('user'),
      );
      if (uu.id !== TG_ADMIN) {
        throw 'no access';
      }
      if (uu) u = uu;
      hasHash = true;
    } catch (e) {
      console.log(e);
    }
  }
  User.findOne({username: u.username})
    .then(async user => {
      if (hasHash && !user) {
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
      } else if (user.salt) {
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
