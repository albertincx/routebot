const mongoose = require('mongoose');

const Route = new mongoose.Schema({
  createdAt: Date,
  category: String,
  name: String,
  pointA: Object,
  pointB: Object,
  userId: Number,
  type: Number,
  status: Number,
});
// Duplicate the ID field.
Route.virtual('id').get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialised.
Route.set('toJSON', {
  virtuals: true,
});
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

Route.pre('save', function (next) {
  if (this.pointA) {
    this.pointA = getPoint(this);
  }
  if (this.pointB) {
    this.pointA = getPoint(this, 'B');
  }
  next();
});

Route.pre(/(updateOne|update)/, function (next) {
  const update = this._update;
  this.set({pointA: getPoint(update, 'A'), pointB: getPoint(update, 'B')});
  return next();
});
mongoose.model('Route', Route);
