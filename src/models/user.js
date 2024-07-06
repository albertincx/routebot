const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    username: String,
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
mongoose.model('User', UserSchema);
