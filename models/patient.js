const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const patientSchema = new mongoose.Schema({
  info: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  appointments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Appointment"
    }
  ]
});

module.exports = mongoose.model('Patient', patientSchema);