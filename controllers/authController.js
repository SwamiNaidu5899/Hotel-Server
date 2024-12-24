const User = require('../models/User'); // Import User model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
  const { name, username, email, password } = req.body;

  // Log incoming data to ensure it's correct
  console.log("Incoming registration data:", req.body);

  try {
    // Check if all fields are present
    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email or username already exists
    const existingUser = await User.findOne({ $or: [{ email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or username' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(hashedPassword);
    

    // Create a new user
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      bookings: [], 
    });

    // Save the new user to the database
    await newUser.save();

    // Generate a JWT token for the user
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log(token);
    console.log(process.env.JWT_SECRET);
    

    // Respond with a success message and token
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
};


// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Us' });
  }
};

// Get user data (excluding password)
const getUserData = async (req, res) => {
  try {
    // Assuming the middleware sets req.user with the decoded token
    const userId = req.user.userId;  // Extract userId from decoded token

    // Fetch the user by ID, excluding the password field
    const user = await User.findById(userId).select('-password');  // Exclude the password field from the response

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user); // Return the user data
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving user data' });
  }
};

// Update user details
const updateUserDetails = async (req, res) => {
  const { name, username, email } = req.body;

  try {
    // Ensure that the user exists
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user details
    user.name = name || user.name;
    user.username = username || user.username;
    user.email = email || user.email;

    await user.save();

    res.status(200).json({ message: 'User details updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user account
const deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id); // Using req.user._id
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  getUserData, 
  updateUserDetails, 
  deleteUserAccount 
};