const express = require('express');
const router = express.Router();
const { 
  createRedirect,
  getRedirectsByUser,
  getRedirectByName,
  updateRedirect,
  deleteRedirect 
} = require('../controllers/redirectController');
const { authenticateUser } = require('../middleware/auth');

// Get all redirects by user (auth required)
router.get('/', authenticateUser, getRedirectsByUser);

// Get redirect by name
router.get('/:name', getRedirectByName);

// Create a new redirect (auth required)
router.post('/', authenticateUser, createRedirect);

// Update a redirect (auth required)
router.put('/:id', authenticateUser, updateRedirect);

// Delete a redirect (auth required)
router.delete('/:id', authenticateUser, deleteRedirect);

module.exports = router;