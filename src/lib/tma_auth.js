const {validate} = require('@tma.js/init-data-node');

const validateTmaAuth = authData => {
  let result = false;

  try {
    validate(authData, process.env.TBTKN);
    result = true;
  } catch (e) {
    // console.error(e);
  }

  return !!process.env.DEV || result;
};
const TG_ADMIN = parseInt(process.env.TGADMIN, 10);

const auth = (req, res, next) => {
  try {
    const authData = req.body.query || req.headers.authorization.split(' ')[1];
    validateTmaAuth(authData);
    let validTgUser = true;
    try {
      const uu = JSON.parse(
        new URL(`https://test/?${authData}`).searchParams.get('user'),
      );
      if (uu.id !== TG_ADMIN) {
        throw 'no access';
      }
      req.user = uu;
      // hasHash = true;
    } catch (e) {
      validTgUser = false;
      console.log(e);
    }
    console.log(validTgUser);
    if (validTgUser) {
      next();
    }
  } catch (e) {
    res.status(401).json({
      error: new Error('Invalid request!'),
    });
  }
};

module.exports = {
  validateTmaAuth,
  auth,
};
