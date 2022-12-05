const mongoose = require('mongoose');

const anySchema = new mongoose.Schema(
  {},
  {
    timestamps: {createdAt: true, updatedAt: false},
    strict: false,
  },
);

anySchema.method({
  transform() {
    return this.toObject();
  },
});
mongoose.model('Any', anySchema);
