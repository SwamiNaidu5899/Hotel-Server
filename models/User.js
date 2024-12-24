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
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',  // Reference to Booking model
  }],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
