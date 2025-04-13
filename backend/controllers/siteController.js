const { Site, User, Subscription, Plan } = require('../models');
const path = require('path');
const fs = require('fs-extra');
const AdmZip = require('adm-zip');
const { sequelize } = require('../models');

/**
 * Upload a new static site
 */
exports.uploadSite = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No ZIP file uploaded'
      });
    }
    
    const { subdomain } = req.body;
    
    if (!subdomain) {
      return res.status(400).json({
        success: false,
        message: 'Subdomain is required'
      });
    }
    
    // Validate subdomain format (only letters, numbers, and hyphens)
    if (!/^[a-z0-9-]+$/i.test(subdomain)) {
      return res.status(400).json({
        success: false,
        message: 'Subdomain must contain only letters, numbers, and hyphens'
      });
    }
    
    // Check if subdomain already exists
    const existingSite = await Site.findOne({ 
      where: { subdomain: subdomain } 
    });
    
    if (existingSite) {
      return res.status(409).json({
        success: false,
        message: 'This subdomain is already taken'
      });
    }
    
    // Check user's site count limit
    const userSitesCount = await Site.count({ 
      where: { UserId: req.user.id } 
    });
    
    // Get user's plan
    const userSubscription = await Subscription.findOne({
      where: { UserId: req.user.id, status: 'active' },
      include: [Plan]
    });
    
    if (!userSubscription) {
      return res.status(403).json({
        success: false,
        message: 'No active subscription found'
      });
    }
    
    const plan = userSubscription.Plan;
    
    // Check if user can create more sites
    if (userSitesCount >= plan.maxSubdomains) {
      return res.status(403).json({
        success: false,
        message: "You've reached your free hosting limit. Please upgrade to Pro."
      });
    }
    
    // Process the uploaded zip file
    const zipPath = req.file.path;
    const siteDir = path.join(__dirname, '../../data/sites', subdomain);
    
    // Extract the zip file
    const zip = new AdmZip(zipPath);
    
    // Make sure the site directory exists
    await fs.ensureDir(siteDir);
    
    // Extract all files
    zip.extractAllTo(siteDir, true);
    
    // Clean up the ZIP file
    await fs.unlink(zipPath);
    
    // Check if index.html exists in the extracted files
    const indexPath = path.join(siteDir, 'index.html');
    if (!await fs.pathExists(indexPath)) {
      await fs.remove(siteDir);
      return res.status(400).json({
        success: false,
        message: 'The ZIP file must contain an index.html file'
      });
    }
    
    // Get file size
    const size = await calculateDirSize(siteDir);
    
    // Create site record in database
    const site = await Site.create({
      subdomain,
      path: siteDir,
      size,
      UserId: req.user.id
    }, { transaction });
    
    await transaction.commit();
    
    res.status(201).json({
      success: true,
      message: 'Site uploaded and deployed successfully',
      site: {
        id: site.id,
        subdomain: site.subdomain,
        url: `https://${subdomain}.sriox.com`,
        size: site.size
      }
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error uploading site:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading site',
      error: error.message
    });
  }
};

/**
 * Get all sites by user
 */
exports.getSitesByUser = async (req, res) => {
  try {
    const sites = await Site.findAll({ 
      where: { UserId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: sites.length,
      sites: sites.map(site => ({
        id: site.id,
        subdomain: site.subdomain,
        url: `https://${site.subdomain}.sriox.com`,
        size: site.size,
        isActive: site.isActive,
        createdAt: site.createdAt,
        lastUpdated: site.lastUpdated
      }))
    });
  } catch (error) {
    console.error('Error getting sites:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving sites',
      error: error.message
    });
  }
};

/**
 * Get site by subdomain
 */
exports.getSiteBySubdomain = async (req, res) => {
  try {
    const { subdomain } = req.params;
    
    const site = await Site.findOne({ 
      where: { subdomain, isActive: true },
      include: [{
        model: User,
        attributes: ['username']
      }]
    });
    
    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Site not found'
      });
    }
    
    res.status(200).json({
      success: true,
      site: {
        id: site.id,
        subdomain: site.subdomain,
        url: `https://${site.subdomain}.sriox.com`,
        owner: site.User.username,
        isActive: site.isActive,
        createdAt: site.createdAt,
        lastUpdated: site.lastUpdated
      }
    });
  } catch (error) {
    console.error('Error getting site:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving site',
      error: error.message
    });
  }
};

/**
 * Update a site
 */
exports.updateSite = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Find the site
    const site = await Site.findOne({ 
      where: { id, UserId: req.user.id } 
    });
    
    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Site not found or you do not have permission to update it'
      });
    }
    
    // If a new ZIP file is uploaded
    if (req.file) {
      // Process the uploaded zip file
      const zipPath = req.file.path;
      const siteDir = path.join(__dirname, '../../data/sites', site.subdomain);
      
      // Clean up the existing site directory
      await fs.emptyDir(siteDir);
      
      // Extract the zip file
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(siteDir, true);
      
      // Clean up the ZIP file
      await fs.unlink(zipPath);
      
      // Check if index.html exists in the extracted files
      const indexPath = path.join(siteDir, 'index.html');
      if (!await fs.pathExists(indexPath)) {
        // Restore the site from backup if available or leave as is
        return res.status(400).json({
          success: false,
          message: 'The ZIP file must contain an index.html file'
        });
      }
      
      // Update file size
      const size = await calculateDirSize(siteDir);
      site.size = size;
    }
    
    // Update other fields if needed
    if (req.body.isActive !== undefined) {
      site.isActive = req.body.isActive;
    }
    
    site.lastUpdated = new Date();
    await site.save({ transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Site updated successfully',
      site: {
        id: site.id,
        subdomain: site.subdomain,
        url: `https://${site.subdomain}.sriox.com`,
        size: site.size,
        isActive: site.isActive,
        lastUpdated: site.lastUpdated
      }
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating site:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating site',
      error: error.message
    });
  }
};

/**
 * Delete a site
 */
exports.deleteSite = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Find the site
    const site = await Site.findOne({ 
      where: { id, UserId: req.user.id } 
    });
    
    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Site not found or you do not have permission to delete it'
      });
    }
    
    // Delete site files
    const siteDir = path.join(__dirname, '../../data/sites', site.subdomain);
    if (await fs.pathExists(siteDir)) {
      await fs.remove(siteDir);
    }
    
    // Delete site record
    await site.destroy({ transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Site deleted successfully'
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting site:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting site',
      error: error.message
    });
  }
};

/**
 * Calculate the size of a directory in bytes
 */
async function calculateDirSize(dirPath) {
  let size = 0;
  
  const files = await fs.readdir(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = await fs.stat(filePath);
    
    if (stats.isDirectory()) {
      size += await calculateDirSize(filePath);
    } else {
      size += stats.size;
    }
  }
  
  return size;
}