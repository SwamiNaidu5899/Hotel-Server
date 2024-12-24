const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController'); // Adjust path as needed
const authenticateJWT = require('../middleware/authenticateJWT'); // Ensure the JWT middleware is correct

// POST /api/bookings - Create a new booking
router.post('/bookings', authenticateJWT, bookingController.createBooking);

// GET /api/bookings - Get all bookings for the authenticated user
// router.get('/user/bookings/:userId', bookingController.getUserBookings);
router.get('/user/bookings', bookingController.getUserBookings);

// GET /api/bookings/:bookingId - Get booking details by ID
router.get('/bookings/:bookingId', authenticateJWT, bookingController.getBookingDetails);

// DELETE /api/bookings/:bookingId - Cancel booking by ID
router.delete('/bookings/:bookingId', authenticateJWT, bookingController.cancelBooking);

module.exports = router;
