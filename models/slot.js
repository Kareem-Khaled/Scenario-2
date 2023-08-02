const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  date: { type: String },
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  duration: { type: Number },
  isHoliday: { type: Boolean, default: false },
});

module.exports = mongoose.model('Slot', slotSchema);
