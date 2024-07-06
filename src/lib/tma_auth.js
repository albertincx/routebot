const {validate} = require('@tma.js/init-data-node');

const TG_ADMIN = parseInt(process.env.TGADMIN, 10);

const auth = (req, res, next) => {
  try {
    const authData = req.body.query || req.headers.authorization.split(' ')[1];
    validate(authData, process.env.TBTKN);
    let validTgUser = true;
    try {
      const url = new URL(`https://test/?${authData}`).searchParams.get('user');
      const parsedUser = JSON.parse(url);

      if (parsedUser.id !== TG_ADMIN) {
        res.status(401).json({
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
      res.status(403).json({
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
