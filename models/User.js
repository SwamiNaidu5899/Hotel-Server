const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  ConfirmPassword:{
    type: String,
    required: true,
  },
  otp: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',  // Reference to Booking model
  }],

  resetPasswordToken: {

    type: String,

  },

  resetPasswordExpire: {

    type: Date,

  },

});

const User = mongoose.model('User', userSchema);

module.exports = User;

