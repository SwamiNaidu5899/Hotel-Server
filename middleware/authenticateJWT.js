const jwt = require('jsonwebtoken');
require('dotenv').config();  // Load environment variables from .env
const secret = process.env.JWT_SECRET;  // Retrieve JWT_SECRET from environment variables

const authenticateJWT = (req, res, next) => {
  // Check if JWT_SECRET is loaded correctly
  if (!secret) {
    console.error('JWT_SECRET is not defined in .env!');
    return res.status(500).json({ message: 'Internal server error: JWT_SECRET not defined' });
  }

  // Extract token from the Authorization header (format: Bearer <token>)
  const token = req.headers['authorization']?.split(' ')[1];

  // If token is missing, return 403 error with message "Token required"
  if (!token) {
    console.error('Token not provided!');
    return res.status(403).json({ message: 'Token required' });
  }

  // Verify the token using JWT_SECRET
  jwt.verify(token, secret, (err, user) => {
    if (err) {
      // If token verification fails, log the error and return 403
      console.error('Token verification failed:', err);
      return res.status(403).json({ message: 'Token is not valid' });
    }

    // Attach the decoded user information to the request object
    req.user = user;
    
    // Proceed to the next middleware or route handler
    next();
  });
};

module.exports = authenticateJWT;
