const express = require('express');
const router = express.Router();
const { addReview, getRoomReviews } = require('../controllers/reviewController');
const authenticate = require('../middleware/authenticate'); // A middleware to verify the user is logged in

// Add a review for a room
router.post('/add', authenticate, addReview);

// Get all reviews for a room
router.get('/:roomId', getRoomReviews);

module.exports = router;
