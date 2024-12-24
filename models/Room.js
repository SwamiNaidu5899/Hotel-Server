const mongoose = require('mongoose');

// Define Room schema
const roomSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },
  image: {
    secure_url: { type: String, required: true },
    public_id: { type: String, required: true }
  },
  bookings: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bookedAt: { type: Date, default: Date.now }
  }],
  // Array of review IDs, this links reviews to the room
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review' // Reference to Review model
  }]
});

// Create Room model
const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
