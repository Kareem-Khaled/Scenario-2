const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  duration: { type: Number, required: true },
  isHoliday: { type: Boolean, required: true, default: false },
});

const Slot = mongoose.model('Slot', slotSchema);

module.exports = Slot;
