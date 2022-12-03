const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    username: String,
    hash: String,
    salt: String,
  },
  {
    timestamps: {createdAt: true, updatedAt: false},
    strict: false,
  },
);
// Duplicate the ID field.
UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialised.
UserSchema.set('toJSON', {
  virtuals: true,
});
mongoose.model('User', UserSchema);
