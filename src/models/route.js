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
Route.pre('save', function (next) {
  const a = {
    type: 'Point',
    coordinates: [],
  };
  if (this.pointA) {
    const point = {...a};
    point.coordinates = this.pointA.split(',').map(Number);
    this.pointA = point;
  }
  if (this.pointB) {
    const point = {...a};
    point.coordinates = this.pointB.split(',').map(Number);
    this.pointB = point;
  }
  console.log(this);
  next();
});
mongoose.model('Route', Route);
