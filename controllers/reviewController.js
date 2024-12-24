const Review = require('../models/Review');
const Room = require('../models/Room');
const User = require('../models/User');

// Add a review for a room
const addReview = async (req, res) => {
  const { roomId, rating, comment } = req.body;

  try {
    // Ensure the user exists (this is assumed to be done via JWT middleware)
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure the room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Create the review
    const review = new Review({
      user: req.user.userId, // User who is leaving the review
      room: roomId, // Room that is being reviewed
      rating, // Rating for the room
      comment // Comment for the room
    });

    await review.save();

    // Add the review to the room's reviews array
    room.reviews.push(review._id);
    await room.save();

    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all reviews for a room
const getRoomReviews = async (req, res) => {
  const { roomId } = req.params;

  try {
    // Ensure the room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Get reviews for this room
    const reviews = await Review.find({ room: roomId }).populate('user', 'name email').exec(); // Populate user data

    res.status(200).json({ reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addReview, getRoomReviews };
