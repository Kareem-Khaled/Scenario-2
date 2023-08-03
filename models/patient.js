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
  ],
  age: {
    type: Number,
    required: true,
    default: 10
  },
  bloodType:{
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true,
    default: 'A+'
  },
  totalSpent: {
    type: Number,
  }
});

module.exports = mongoose.model('Patient', patientSchema);