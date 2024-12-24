const mongoose = require('mongoose');

// Define Review schema
const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User model
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room', // Reference to Room model
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1, // Rating should be between 1 and 5
    max: 5
  },
  comment: {
    type: String,
    required: true
  }
});

// Create Review model
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
