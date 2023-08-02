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
  specialty: { type: String }
});

module.exports = mongoose.model('Doctor', doctorSchema);