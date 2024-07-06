const mongoose = require('mongoose');
const {mongo} = require('./vars');

exports.connect = uri => {
  const dbUri = uri || mongo.uri;
  if (!dbUri) {
    return false;
  }
  mongoose.connect(
    dbUri,
    {
      connectTimeoutMS: 30000,
    });
  return mongoose.connection;
};
