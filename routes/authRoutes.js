const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserData, 
  updateUserDetails, 
  deleteUserAccount ,
  verifyOtp,
  forgetPassword,
  resetPassword
} = require('../controllers/authController');
const authenticateJWT = require('../middleware/authenticateJWT');  // Import authentication middleware

// Register a new user
router.post('/register', registerUser);

router.post("/forget-password", forgetPassword);
router.post("/reset-password/:resetToken", resetPassword);

router.post('/verify-otp',verifyOtp)

// Login user
router.post('/login', loginUser);

// Get user data (requires authentication)
router.get('/user', authenticateJWT, getUserData);

// Update user details (requires authentication)
router.put('/user', authenticateJWT, updateUserDetails);

// Delete user account (requires authentication)
router.delete('/user', authenticateJWT, deleteUserAccount);

module.exports = router;
