const express = require('express');
const router = express.Router();
const { 
  createGithubPageMapping,
  getGithubPagesByUser,
  getGithubPageBySubdomain,
  updateGithubPageMapping,
  deleteGithubPageMapping,
  verifyGithubPage
} = require('../controllers/githubPageController');
const { authenticateUser } = require('../middleware/auth');

// Get all GitHub Pages mappings by user (auth required)
router.get('/', authenticateUser, getGithubPagesByUser);

// Get GitHub Pages mapping by subdomain
router.get('/:subdomain', getGithubPageBySubdomain);

// Create a new GitHub Pages mapping (auth required)
router.post('/', authenticateUser, createGithubPageMapping);

// Update a GitHub Pages mapping (auth required)
router.put('/:id', authenticateUser, updateGithubPageMapping);

// Delete a GitHub Pages mapping (auth required)
router.delete('/:id', authenticateUser, deleteGithubPageMapping);

// Verify GitHub Pages mapping ownership (auth required)
router.post('/:id/verify', authenticateUser, verifyGithubPage);

module.exports = router;