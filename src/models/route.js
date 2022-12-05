const mongoose = require('mongoose');
const {getPoint} = require('../lib/utils');

const Route = new mongoose.Schema(
  {
    createdAt: Date,
    category: String,
    name: String,
    pointA: Object,
    pointB: Object,
    userId: Number,
    type: Number,
    status: Number,
  },
  {
    timestamps: {createdAt: true, updatedAt: false},
    strict: false,
  },
);
// Duplicate the ID field.
Route.virtual('id').get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialised.
Route.set('toJSON', {
  virtuals: true,
});

Route.pre('save', function (next) {
  if (this.pointA) {
    this.pointA = getPoint(this);
  }
  if (this.pointB) {
    this.pointB = getPoint(this, 'B');
  }
  this.category = 'Routes';
  this.status = this.status ? 1 : 0;
  next();
});
mongoose.model('Route', Route);
