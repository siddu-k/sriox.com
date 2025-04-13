const { User, Plan, Subscription } = require('../models');
const { generateToken } = require('../middleware/auth');
const crypto = require('crypto');

/**
 * Register a new user
 */
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if username or email already exists
    const existingUser = await User.findOne({ 
      where: { 
        [sequelize.Op.or]: [
          { username: username },
          { email: email }
        ] 
      } 
    });
    
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(409).json({ 
          success: false, 
          message: 'Username already taken' 
        });
      } else {
        return res.status(409).json({ 
          success: false, 
          message: 'Email already registered' 
        });
      }
    }
    
    // Create the user
    const user = await User.create({
      username,
      email,
      password
    });
    
    // Get the free plan
    const freePlan = await Plan.findOne({ where: { name: 'Free' } });
    if (!freePlan) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error setting up user plan' 
      });
    }
    
    // Create user subscription with free plan
    await Subscription.create({
      UserId: user.id,
      PlanId: freePlan.id,
      status: 'active'
    });
    
    // Generate JWT token
    const token = generateToken(user);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

/**
 * Login a user
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find the user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check password
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Update last login time
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT token
    const token = generateToken(user);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

/**
 * Verify email address
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Logic to verify email with token (you would need to store verification tokens)
    // For now, we'll keep this as a placeholder
    
    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying email',
      error: error.message
    });
  }
};

/**
 * Request password reset
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find the user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // For security reasons, always return success even if email not found
      return res.status(200).json({
        success: true,
        message: 'Password reset link sent to your email'
      });
    }
    
    // Generate reset token
    // In a real app, you'd store this token and expiry in the database
    // and send an email with a link to reset password
    
    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing request',
      error: error.message
    });
  }
};

/**
 * Reset password with token
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    // Logic to verify token and reset password
    // For now, this is a placeholder
    
    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
};