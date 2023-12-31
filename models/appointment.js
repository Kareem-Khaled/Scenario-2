const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
  status: {
    type: String, 
    enum: ['Finished', 'Pending', 'Cancelled', 'Reporting'],
    required: true 
  },
  slot: {
    type: Schema.Types.Mixed,
  },
  report: { 
    type: String 
  },
  cost: { 
    type: Number, 
    required: true 
  }

});

module.exports = mongoose.model('Appointment', appointmentSchema);

