const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const doctorSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  specialty: { type: String },
  contact: { type: String },
  location: { type: String },
  gender: { type: String, enum: ['male', 'female'], required: true },
  slots: [
    {
        type: Schema.Types.ObjectId,
        ref: "Slot"
    }
  ],
});

doctorSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('Doctor', doctorSchema);