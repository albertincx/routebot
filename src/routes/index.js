const fs = require('fs');
const router = require('express')
  .Router();
const mongoose = require('mongoose');

require('../models/route');

router.use('/users', require('./users'));
router.use('/routes', require('./routes'));
// router.use('/search', require('./search'));

const Route = mongoose.model('Route');

const TG_ADMIN = parseInt(process.env.TGADMIN, 10);
const filepath = 'update.txt';

router.get('/restart/1', (req, res) => {
  const {id: userId} = req.user;
  if (userId !== TG_ADMIN) {
    res.status(200)
      .send('');
    return;
  }
  try {
    // eslint-disable-next-line global-require
    const {spawn} = require('child_process');
    const gpull = spawn('git', ['pull']);
    const rest = spawn('pm2', ['restart', 'Routes']);

    gpull.stdout.pipe(rest.stdin);
    rest.stdout.pipe(process.stdin);

    fs.writeFileSync(filepath, `${new Date()}`);

    res.status(200)
      .json({
        success: true,
        id: '1',
      });
  } catch (e) {
    res.status(500)
      .send('');
  }
});

router.get('/show/:id', (req, res) => {
  const filter = {_id: req.params.id};
  Route.findOne(filter, '_id pointA pointB')
    .then(r => res.status(200)
      .json(r))
    .catch(err => {
      res.json({success: false, message: err});
    });
});
module.exports = router;
