const User = require('../models/User'); // Import User model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {sendEmail} = require('../config/sendMail')

const registerUser = async (req, res) => {
  const { name, username, email, password, ConfirmPassword} = req.body;

  // Log incoming data to ensure it's correct
  console.log("Incoming registration data:", req.body);

  try {
    // Check if all fields are present
    if (!name || !username || !email || !password || ! ConfirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email or username already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or username' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create a new user
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      ConfirmPassword: hashedPassword,
      bookings: [],
      otp, // Store OTP temporarily in the database (or you can create a separate OTP collection)
      otpExpiration: Date.now() + 15 * 60 * 1000, // Set OTP expiration to 15 minutes (example)
    });

    // Save the new user to the database
    await newUser.save();

    // Send OTP via email
    const emailContent = `Hi ${name},\n\nThank you for registering! Please use the following OTP to verify your email:\n\n${otp}\n\nThe OTP will expire in 15 minutes.\n\nBest regards,\nYour Team`;

    await sendEmail(email, 'Verify Your Email', emailContent);

    // Respond with a success message and instruct user to verify OTP
    res.status(201).json({ 
      message: 'User registered successfully. Please verify the OTP sent to your email.' 
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
};


const verifyOtp = async (req, res) => {
  const { otp } = req.body;

  try {
      const user = await User.findOne({ otp });

      if (!user || user.otp !== otp) {
          return res.status(400).json({ message: "Invalid OTP!" });
      }

      user.isVerified = true;
      user.otp = null;
      await user.save();

      res.status(200).json({ message: "Account verified successfully!" });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;
 
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with this email address." });
    }
 
    // Generate reset token
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    // const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000;
 
    await user.save();
 
    // const resetUrl = `http://${req.headers.host}/api/users/reset-password/${resetToken}`;
    const resetUrl = `${process.env.client_url}/reset-password/${resetToken}`;
    console.log(process.env.client_url);
    console.log(resetToken);
 
    const emailContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; background-color: #f4f4f9; border-radius: 8px; max-width: 600px; margin: auto;">
      <h2 style="color: #3949ab; text-align: center;">Password Reset Request</h2>
  
      <p style="font-size: 16px;">
        Hi <strong style="color: #3949ab;">${user.username}</strong>,
      </p>
  
      <p style="font-size: 16px;">
        Thank you for requesting a password reset. Please follow the link below to reset your password.
      </p>
  
      <p style="font-size: 16px; text-align: center; margin-top: 20px;">
        <a href="${resetUrl}" style="text-decoration: none; background-color: #3949ab; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px; font-weight: bold; transition: background-color 0.3s;">
          Click here to reset your password
        </a>
      </p>
  
      <p style="font-size: 16px;">
        If you did not request a password reset, please ignore this email or contact support immediately.
      </p>
  
      <div style="text-align: center; margin-top: 30px;">
        <p style="font-size: 16px; color: #555;">
          Best regards,<br>
          <strong style="color: #3949ab;">GiveHope Team</strong>
        </p>
      </div>
  
      <footer style="font-size: 12px; color: #777; text-align: center; margin-top: 50px;">
        <p>&copy; ${new Date().getFullYear()} GiveHope. All rights reserved.</p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
      </footer>
    </div>
  `;
  
 
    await sendEmail(email, "Password Reset Request", emailContent, true);
 
    res.status(200).json({
      message: "Password reset link has been sent to your email.",
    });
  } catch (error) {
    console.error("Error during password reset request:", error.message);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};
 
// reset
// reset
const resetPassword = async (req, res) => {
  const { password, confirmpassword } = req.body;
  const { resetToken } = req.params;
 
  try {
    // Check if both passwords match
    if (password !== confirmpassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
 
    // Find the user with the reset token
    const user = await User.findOne({ resetPasswordToken: resetToken });
 
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }
 
    // Check if the token has expired (1 hour expiry time)
    if (user.resetPasswordExpire < Date.now()) {
      return res.status(400).json({ message: "Reset token has expired" });
    }
 
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
 
    // Update user's password
    user.password = hashedPassword;
    user.confirmpassword = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
 
    await user.save();
 
    // Send email confirmation
    const emailContent = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; background-color: #f4f4f9; border-radius: 8px; max-width: 600px; margin: auto;">
    <h2 style="color: #3949ab; text-align: center;">Password Reset Successful</h2>
    
    <p style="font-size: 16px;">
      Hi <strong style="color: #3949ab;">${user.username}</strong>,
    </p>

    <p style="font-size: 16px;">
      Your password has been successfully reset. You can now log in with your new password.
    </p>

    <p style="font-size: 16px;">
      If you did not request this change, please contact our support team immediately.
    </p>

    <div style="text-align: center; margin-top: 30px;">
      <p style="font-size: 16px; color: #555;">
        Best regards,<br>
        <strong style="color: #3949ab;">GiveHope Team</strong>
      </p>
    </div>

    <footer style="font-size: 12px; color: #777; text-align: center; margin-top: 50px;">
      <p>&copy; ${new Date().getFullYear()} GiveHope. All rights reserved.</p>
      <p>If you have any questions, feel free to reach out to our support team.</p>
    </footer>
  </div>
`;

 
    await sendEmail(
      user.email,
      "Password Reset Confirmation",
      emailContent,
      true
    );
 
    res.status(200).json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error("Error during password reset:", error.message);
    res
      .status(500)
      .json({ message: "Failed to reset password", error: error.message });
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
  deleteUserAccount ,
  verifyOtp,
  forgetPassword,
  resetPassword,
};
