const mongoose = require('mongoose');
const {
  Schema,
  Types: { ObjectId },
} = mongoose;

const exerciseSchema = new Schema(
  {
    userId: { type: ObjectId },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    rawDate: { type: Date, required: true },
  },
  { versionKey: false }
);

exerciseSchema.virtual('date').get(function () {
  return this.rawDate.toDateString();
});

module.exports = {
  model: mongoose.model('Exercise', exerciseSchema),
  schema: exerciseSchema,
};
