const {DEV} = require('../config/vars');
const {verifySignature} = require('./login');
const {validate, parse} = require('@telegram-apps/init-data-node');
const db = require('../api/utils/db');

const validateTmaAuth = (qUStrOrObj = '') => {
  let result = false;
  try {
    let url = new URLSearchParams(qUStrOrObj);
    const auth = url.get('auth');
    url.delete('auth');
    url.delete('ref');
    url.delete('v');
    const u = Object.fromEntries(url);

    let isWidget = auth === 'widget';
    const botToken = process.env.TBTKN;
    if (!DEV) {
      if (isWidget) {
        const isValid = verifySignature(u, botToken);
        return isValid && u;
      } else {
        let q = url.toString();
        // console.log(q);
        validate(q, botToken, {expiresIn: 3600});
        // console.log('u');
        return parse(q).user;
      }
    } else {
      // test id
      // u.id = 36058859;
      // u.id = 487323673;
    }
    return u;
  } catch (e) {
    console.log(e);
  }

  return result;
};

const auth = async (req, res, next) => {
  try {
    let authData = (req.headers.authorization || '').split(' ')[1];
    let validTgUser = validateTmaAuth(authData);
    if (process.env.DEV) {
      validTgUser = true;
    }
    if (validTgUser) {
      const u = await db.GetUser(validTgUser.id);
      if (u) validTgUser.invitePoints = u.invitePoints;
      req.user = validTgUser;
      return next();
    }

    res.status(401).json({error: new Error('Invalid request!')});
  } catch (e) {
    next(e);
  }
};

module.exports = {auth, validateTmaAuth};
