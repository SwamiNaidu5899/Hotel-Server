const { Query } = require('mongoose');
const Booking = require('../models/Booking'); // Import the Booking model
const User = require('../models/User'); // Import the User model

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    // Destructure required fields from the request body
    const { roomId, roomName, price, bookingDate, checkInDate, checkOutDate } = req.body;

    // Access the userId from req.user (after JWT token authentication)
    const userId = req.user?.userId; // Make sure this matches the field in your token

    // Check if userId exists
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Log the booking details and user ID for debugging
    console.log('User ID:', userId);
    console.log('Room ID:', roomId);
    console.log('Room Name:', roomName);
    console.log('Price:', price);
    console.log('Booking Date:', bookingDate);
    console.log('Check-In Date:', checkInDate);
    console.log('Check-Out Date:', checkOutDate);

    // Check if all required fields are provided
    if (!roomId || !roomName || !price || !bookingDate || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Missing required booking details' });
    }

    // Validate the price field
    if (typeof price !== 'number' || isNaN(price)) {
      return res.status(400).json({ message: 'Invalid price' });
    }

    // Parse the check-in and check-out dates to validate
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Check if the dates are valid
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.status(400).json({ message: 'Invalid check-in or check-out date' });
    }

    // Ensure the check-out date is after the check-in date
    if (checkIn >= checkOut) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    // Create a new booking object
    const newBooking = new Booking({
      user: userId, // Assign the user ID from the decoded JWT
      room: roomId,  // Make sure to assign the room to the 'room' field
      roomName,
      price,
      bookingDate,
      checkInDate,
      checkOutDate,
    });

    // Save the booking to the database
    await newBooking.save();

    // Return the created booking in the response
    return res.status(201).json({
      message: 'Booking created successfully',
      booking: newBooking,
    });
  } catch (error) {
    // Log and return any errors that occur
    console.error('Error creating booking:', error);
    return res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
};

// app.get("/categories/category/:categoryID", (req, res) => {
//   const categoryID = req.params.categoryID;
//   const q = "SELECT * FROM categories where categoryID=?";
//   db.query(q, [categoryID], (err, data) => {
//     console.log(err, data);
//     if (err) return res.json({ error: err.sqlMessage });
//     else return res.json({ data });
//   });
// });

// Get all bookings for the authenticated user
// Get all bookings for a user
exports.getUserBookings = async (req, res) => {
  try {

    // const userId = req.params.userId; // Get userId from token
    const userId = "676a6371a1e1768cd5bbb18d"; // Get userId from token
    
    // Log userId for debugging
    console.log('User ID from token:', userId);

    if (!userId) {
      console.log('No user ID found in token');
      return res.status(400).json({ message: 'User not authenticated' });
    }

    // Find all bookings by the user and populate the room details
    const bookings = await Booking.find({ user: userId })
      .populate('room') // Populate room details if room is a reference
      .exec();

    // Log the bookings to check if data is retrieved
    console.log('Bookings fetched:', bookings);

    // If no bookings found
    if (!bookings || bookings.length === 0) {
      console.log('No bookings found for the user');
      return res.status(404).json({ message: 'No bookings found' });
    }

    // Send the bookings data as a response
    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({ message: 'Error fetching bookings' });
  }
};


// Get details of a specific booking by its ID
exports.getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Fetch the booking by its ID
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    return res.status(200).json(booking);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching booking details' });
  }
};

// Cancel a booking by its ID
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Find the booking by ID
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Remove the booking from the database
    await booking.remove();

    // Optionally, remove the booking reference from the user's bookings array
    const user = await User.findById(booking.user);
    user.bookings = user.bookings.filter((b) => b.toString() !== bookingId);
    await user.save();

    return res.status(200).json({ message: 'Booking canceled successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error canceling booking' });
  }
};
