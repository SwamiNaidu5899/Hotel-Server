const Room = require('../models/Room');
const { validationResult } = require('express-validator'); // For validation
const multer = require('multer'); // Assuming you're using multer for file handling

// Add Room
const addRoom = async (req, res) => {
  try {
    // Input validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, author, price, isAvailable } = req.body;
    const image = req.file?.path || req.body.image;

    if (!image) {
      return res.status(400).json({ message: 'Image is required.' });
    }

    const existingRoom = await Room.findOne({ title });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room with this title already exists.' });
    }

    const newRoom = new Room({
      title,
      description,
      author,
      price,
      isAvailable,
      image,
    });

    await newRoom.save();
    res.status(201).json({ message: 'Room added successfully', newRoom });
  } catch (err) {
    res.status(500).json({ message: 'Error adding Room', error: err.message });
  }
};

// Update Room
const updateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { title, description, author, price, isAvailable, image } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    room.title = title || room.title;
    room.description = description || room.description;
    room.author = author || room.author;
    room.price = price || room.price;
    room.isAvailable = isAvailable || room.isAvailable;
    room.image = image || room.image;

    await room.save();

    res.status(200).json({ message: 'Room updated successfully', room });
  } catch (err) {
    res.status(500).json({ message: 'Error updating Room', error: err.message });
  }
};

// Delete Room
const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const result = await Room.findByIdAndDelete(roomId);

    if (!result) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting Room', error: err.message });
  }
};

// Get All Rooms
const getAllRooms = async (req, res) => {
  try {
    const roomsList = await Room.find();

    if (roomsList.length === 0) {
      return res.status(404).json({ message: 'No Rooms found' });
    }

    res.status(200).json(roomsList);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving Rooms', error: err.message });
  }
};

// Get Single Room by ID
const getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json(room);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving Room', error: err.message });
  }
};

// Book a Room (only if logged in)
const bookRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;  // Assuming the user is authenticated and their ID is in `req.user`

    // Find the room by its ID
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if the room is available
    if (!room.isAvailable) {
      return res.status(400).json({ message: 'Room is not available for booking' });
    }

    // Check if the user has already booked this room (optional)
    const existingBooking = room.bookings.find(booking => booking.userId.toString() === userId.toString());
    if (existingBooking) {
      return res.status(400).json({ message: 'You have already booked this room' });
    }

    // Add the booking to the room
    room.bookings.push({ userId, bookedAt: new Date() });

    // Mark room as unavailable after booking
    room.isAvailable = false;

    // Save the room with the updated bookings and availability status
    await room.save();

    res.status(200).json({ message: 'Room booked successfully', room });
  } catch (err) {
    res.status(500).json({ message: 'Error booking room', error: err.message });
  }
};


module.exports = {
  addRoom,
  updateRoom,
  deleteRoom,
  getAllRooms,
  getRoomById,
  bookRoom,  // Export the bookRoom function
};
