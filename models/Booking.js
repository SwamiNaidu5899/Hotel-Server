const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Reference to the User model
    required: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
      ref: 'Room', // For simplicity, let's assume room is a string, but it can be a reference to a Room model
    required: true,
  },
  checkInDate: {
    type: Date,
    required: true,
  },
  checkOutDate: {
    type: Date,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: 'Booked',  // Status can be "Booked", "Cancelled", etc.
  },
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
