const {validate} = require('@tma.js/init-data-node');

const TG_ADMIN = parseInt(process.env.TGADMIN, 10);

const validateTmaAuth = (initData) => {
  let result = false;

  try {
    validate(initData, process.env.TBTKN);
    result = true;
  } catch (e) {
    // console.error("---tma_auth----");
    // console.error(new Date());
    // console.error(e);
    // console.error(requestBody);
    // console.error("---------------");
  }
  return result;
};

const auth = (req, res, next) => {
  try {
    let authData = req.body.query;
    if (!authData) {
      let authHeader = req.headers.authorization;
      if (authHeader) {
        authData = authHeader.split(' ')[1];
      }
    }
    let validTgUser = validateTmaAuth(authData);
    try {
      const url = new URL(`https://test/?${authData}`).searchParams.get('user');
      const parsedUser = JSON.parse(url);

      if (parsedUser.id !== TG_ADMIN) {
        res.status(403)
          .json({
            error: new Error('Invalid request!'),
          });
      } else {
        req.user = parsedUser;
      }
    } catch (e) {
      validTgUser = false;
    }
    if (validTgUser) {
      next();
    } else {
      res.status(401)
        .json({
          error: new Error('Invalid request!'),
        });
    }
  } catch (e) {
    next(e);
  }
};

module.exports = {
  auth,
};
