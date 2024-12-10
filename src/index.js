const express = require('express');

const {PORT} = require('./config/vars');
const mongoose = require('./config/mongoose');
const botRoute = require('./api/routes/bot');
const botInstance = require('./config/bot');
require('./links');
const {setup} = require('./app');
const init = require('./cron');

const conn = mongoose.connect();
const app = express();
setup(app);
if (process.env.TBTKN && botInstance) {
  const {router, bot: bh} = botRoute(botInstance, conn);
  if (bh) {
    init(bh);
  }
  app.use('/bot', router);
}

app.listen(PORT, () => console.info(`server started on port ${PORT}`));
module.exports = app;
