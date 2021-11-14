const express = require('express');

const {PORT} = require('./config/vars');
const mongoose = require('./config/mongoose');
const botRoute = require('./api/routes/bot');
const botInstance = require('./config/bot');

const conn = mongoose.connect();
const app = express();

if (process.env.TBTKN && botInstance) {
  const {router} = botRoute(botInstance, conn);
  app.use('/bot', router);
}

app.listen(PORT, () => console.info(`server started on port ${PORT}`));
module.exports = app;