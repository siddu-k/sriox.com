const express = require('express');
const router = express.Router();
const { 
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserStats,
  upgradeUserPlan 
} = require('../controllers/userController');
const { authenticateUser } = require('../middleware/auth');

// Get user profile (auth required)
router.get('/profile', authenticateUser, getUserProfile);

// Update user profile (auth required)
router.put('/profile', authenticateUser, updateUserProfile);

// Change user password (auth required)
router.put('/change-password', authenticateUser, changePassword);

// Get user stats - counts of sites, redirects, and GitHub Pages (auth required)
router.get('/stats', authenticateUser, getUserStats);

// Upgrade user plan (auth required)
router.post('/upgrade', authenticateUser, upgradeUserPlan);

module.exports = router;