const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware to authenticate user based on JWT token
 */
exports.authenticateUser = async (req, res, next) => {
  try {
    // Get the token from the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false, 
        message: 'Authentication required. Please log in.'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Find the user
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false, 
        message: 'User not found. Please log in again.'
      });
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false, 
      message: 'Invalid token. Please log in again.'
    });
  }
};

/**
 * Generate JWT token
 */
exports.generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }  // Token expires in 7 days
  );
};