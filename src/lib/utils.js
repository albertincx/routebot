const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const pathToKey = path.join(__dirname, '../', 'id_rsa_priv.pem');
const PRIV_KEY = fs.readFileSync(pathToKey, 'utf8');

/**
 * -------------- HELPER FUNCTIONS ----------------
 */

/**
 *
 * @param {*} password - The plain text password
 * @param {*} hash - The hash stored in the database
 * @param {*} salt - The salt stored in the database
 *
 * This function uses the crypto library to decrypt the hash using the salt and then compares
 * the decrypted hash/salt with the password that the user provided at login
 */
function validPassword(password, hash, salt) {
  const hashVerify = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');
  return hash === hashVerify;
}

/**
 *
 * @param {*} password - The pwd str that the user inputs to the password field in the register form
 *
 * This fun takes a text pwd and creates a salt and hash out of it.  Inste of storing the plaintext
 * password in the database, the salt and hash are stored for security
 *
 * alt: It would also be acc to just use a hashing alg to make a hash of the plain text password.
 * You'd then store the hash. pwd in the db and then re-hash it to verify later
 */
function genPassword(password) {
  const salt = crypto.randomBytes(32).toString('hex');
  const genHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');

  return {
    salt,
    hash: genHash,
  };
}

/**
 * @param {*} user - We need this to set the JWT `sub` payload property to the MongoDB user ID
 */
function issueJWT(user) {
  const {_id} = user;

  const expiresIn = process.env.EXPIRES || '1d';

  const payload = {
    sub: _id,
    iat: Math.floor(Date.now() / 1000),
  };

  const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, {
    expiresIn,
    algorithm: 'RS256',
  });

  return {
    token: `Bearer ${signedToken}`,
    expires: expiresIn,
  };
}

const a = {
  type: 'Point',
  coordinates: [],
};
const getPoint = (upd, pointKey) => {
  let _pointKey = 'pointA';
  if (pointKey === 'B') {
    _pointKey = 'pointB';
  }
  const point = {...a};
  if (upd[_pointKey]) {
    if (typeof upd[_pointKey] === 'object') {
      point.coordinates = upd[_pointKey].coordinates;
    } else {
      point.coordinates = upd[_pointKey].split(',').map(Number);
    }
  }
  return point;
};

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.issueJWT = issueJWT;
module.exports.getPoint = getPoint;
