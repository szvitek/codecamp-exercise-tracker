const mongoose = require('mongoose');
const { schema: exerciseSchema } = require('./exercise');
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    log: [exerciseSchema],
  },
  { versionKey: false }
);

module.exports = mongoose.model('User', userSchema);
