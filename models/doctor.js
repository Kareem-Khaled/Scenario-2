const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const doctorSchema = new mongoose.Schema({
  info: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  slots: [
    {
        type: Schema.Types.ObjectId,
        ref: "Slot"
    }
  ],
  appointments: [
    {
        type: Schema.Types.ObjectId,
        ref: "Appointment"
    }
  ],
  specialty: { 
    type: String
  },
  appointmentCost: {
    type: Number,
    default: 10
  },
  brief: {
    type: String,
  }
});

module.exports = mongoose.model('Doctor', doctorSchema);