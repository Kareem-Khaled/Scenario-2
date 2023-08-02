const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  gender: { 
    type: String,
    enum: ['male', 'female'], 
    required: true 
  },
  isDoctor: {
    type: Boolean, 
    required: true
  },
  image: { 
    type: String, 
    required: true 
  },
  phone: { type: String },
  location: { type: String },
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);