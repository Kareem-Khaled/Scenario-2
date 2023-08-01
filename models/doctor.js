const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  contact: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  slots: [
    {
        type: Schema.Types.ObjectId,
        ref: "Slot"
    }
  ],
});

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
