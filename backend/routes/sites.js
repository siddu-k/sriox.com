const express = require('express');
const router = express.Router();
const { 
  uploadSite, 
  getSitesByUser, 
  getSiteBySubdomain, 
  updateSite,
  deleteSite 
} = require('../controllers/siteController');
const { authenticateUser } = require('../middleware/auth');
const upload = require('../middleware/fileUpload');

// Get all sites by user (auth required)
router.get('/', authenticateUser, getSitesByUser);

// Get site by subdomain
router.get('/:subdomain', getSiteBySubdomain);

// Upload a new site (auth required) with file upload middleware
router.post('/upload', authenticateUser, upload.single('siteZip'), uploadSite);

// Update a site (auth required)
router.put('/:id', authenticateUser, upload.single('siteZip'), updateSite);

// Delete a site (auth required)
router.delete('/:id', authenticateUser, deleteSite);

module.exports = router;