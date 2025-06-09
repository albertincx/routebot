const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv-safe');

const envPath = path.join(__dirname, '../../.env');

if (fs.existsSync(envPath)) {
  dotenv.config({
    allowEmptyValues: true,
    path: envPath,
    sample: path.join(__dirname, '../../.env.example'),
  });
}

const confFile = path.join(__dirname, '../../.conf');
if (!fs.existsSync(confFile)) fs.mkdirSync(confFile);

module.exports = {
  root: path.join(__dirname, '/../../'),
  PORT: process.env.PORT || 4000,
  TGADMIN: +process.env.TGADMIN || 0,
  mongo: {
    uri: process.env.MONGO_URI,
  },
  maxRouteLimit: process.env.MAX_LIMIT || 5,
};
