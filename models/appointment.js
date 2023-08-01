const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  doctor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor', 
    required: true 
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient', 
    required: true 
  },
  date: { type: Date, required: true },
  status: {
    type: String, 
    enum: ['Finished', 'Pending', 'Cancelled'],
    required: true 
  },
  duration: { type: Number, required: true },
  description: { type: String },
  cost: { type: Number, required: true }

});

module.exports = mongoose.model('Appointment', appointmentSchema);

