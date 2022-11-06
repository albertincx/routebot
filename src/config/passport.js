const JwtStrategy = require('passport-jwt').Strategy;
const {ExtractJwt} = require('passport-jwt');
const fs = require('fs');
const path = require('path');
const User = require('mongoose').model('User');

const pathToKey = path.join(__dirname, '..', 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');

// At a minimum, you must pass the `jwtFromRequest` and `secretOrKey` properties
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: PUB_KEY,
  algorithms: ['RS256'],
};

// app.js will pass the global passport object here, and this function will configure it
module.exports = passport => {
  // The JWT payload is passed into the verify callback
  passport.use(
    new JwtStrategy(options, (jwtPayload, done) => {
      // console.log(jwt_payload, options);
      // We will assign the `sub` property on the JWT to the database ID of user
      User.findOne({_id: jwtPayload.sub}, (err, user) => {
        // This flow look familiar?  It is the same as when we implemented
        // the `passport-local` strategy
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      });
    }),
  );
};
