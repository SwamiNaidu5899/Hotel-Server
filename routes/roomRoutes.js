const express = require('express');
const router = express.Router();
const { 
  addRoom,         
  updateRoom,      
  deleteRoom,      
  getAllRooms,     
  getRoomById,     
  bookRoom,        // Added route to book a room
} = require('../controllers/roomController');

// Route to add a new room
router.post('/add', addRoom);

// Route to update an existing room by roomId
router.put('/update/:roomId', updateRoom);

// Route to delete a room by roomId
router.delete('/delete/:roomId', deleteRoom);

// Route to get all rooms
router.get('/', getAllRooms);

// Route to get a room by roomId
router.get('/:roomId', getRoomById);

// Route to book a room (only if the user is logged in)
router.post('/book/:roomId', bookRoom);

module.exports = router;
