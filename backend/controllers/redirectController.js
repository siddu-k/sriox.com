const { Redirect, User, Subscription, Plan } = require('../models');
const path = require('path');
const fs = require('fs-extra');
const { sequelize } = require('../models');

/**
 * Create a new redirect
 */
exports.createRedirect = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { name, targetUrl } = req.body;
    
    if (!name || !targetUrl) {
      return res.status(400).json({
        success: false,
        message: 'Name and target URL are required'
      });
    }
    
    // Validate name format (only letters, numbers, and hyphens)
    if (!/^[a-z0-9-]+$/i.test(name)) {
      return res.status(400).json({
        success: false,
        message: 'Name must contain only letters, numbers, and hyphens'
      });
    }
    
    // Validate URL format
    try {
      new URL(targetUrl);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid target URL'
      });
    }
    
    // Check if name already exists
    const existingRedirect = await Redirect.findOne({ 
      where: { name } 
    });
    
    if (existingRedirect) {
      return res.status(409).json({
        success: false,
        message: 'This redirect name is already taken'
      });
    }
    
    // Check user's redirect count limit
    const userRedirectsCount = await Redirect.count({ 
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
    
    // Check if user can create more redirects
    if (userRedirectsCount >= plan.maxRedirects) {
      return res.status(403).json({
        success: false,
        message: "You've reached your free redirects limit. Please upgrade to Pro."
      });
    }
    
    // Create HTML file with meta refresh
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting to ${targetUrl}</title>
  <meta http-equiv="refresh" content="0; URL=${targetUrl}">
  <link rel="canonical" href="${targetUrl}">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      text-align: center;
      padding: 50px;
      background-color: #f8f9fa;
      color: #212529;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    a {
      color: #007bff;
      text-decoration: none;
    }
    .powered-by {
      margin-top: 40px;
      font-size: 0.8rem;
      color: #6c757d;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Redirecting...</h1>
    <p>If you are not redirected automatically, <a href="${targetUrl}">click here</a>.</p>
    <div class="powered-by">Powered by <a href="https://sriox.com">sriox.com</a></div>
  </div>
</body>
</html>
    `;
    
    const filePath = path.join(__dirname, '../../data/subpages', `${name}.html`);
    
    // Ensure the subpages directory exists
    await fs.ensureDir(path.join(__dirname, '../../data/subpages'));
    
    // Write the HTML file
    await fs.writeFile(filePath, htmlContent);
    
    // Create redirect record in database
    const redirect = await Redirect.create({
      name,
      targetUrl,
      path: filePath,
      UserId: req.user.id
    }, { transaction });
    
    await transaction.commit();
    
    res.status(201).json({
      success: true,
      message: 'Redirect created successfully',
      redirect: {
        id: redirect.id,
        name: redirect.name,
        url: `https://sriox.com/${name}`,
        targetUrl: redirect.targetUrl
      }
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating redirect:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating redirect',
      error: error.message
    });
  }
};

/**
 * Get all redirects by user
 */
exports.getRedirectsByUser = async (req, res) => {
  try {
    const redirects = await Redirect.findAll({ 
      where: { UserId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: redirects.length,
      redirects: redirects.map(redirect => ({
        id: redirect.id,
        name: redirect.name,
        url: `https://sriox.com/${redirect.name}`,
        targetUrl: redirect.targetUrl,
        isActive: redirect.isActive,
        lastUpdated: redirect.lastUpdated,
        createdAt: redirect.createdAt
      }))
    });
  } catch (error) {
    console.error('Error getting redirects:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving redirects',
      error: error.message
    });
  }
};

/**
 * Get redirect by name
 */
exports.getRedirectByName = async (req, res) => {
  try {
    const { name } = req.params;
    
    const redirect = await Redirect.findOne({ 
      where: { name, isActive: true },
      include: [{
        model: User,
        attributes: ['username']
      }]
    });
    
    if (!redirect) {
      return res.status(404).json({
        success: false,
        message: 'Redirect not found'
      });
    }
    
    res.status(200).json({
      success: true,
      redirect: {
        id: redirect.id,
        name: redirect.name,
        url: `https://sriox.com/${redirect.name}`,
        targetUrl: redirect.targetUrl,
        owner: redirect.User.username,
        isActive: redirect.isActive,
        lastUpdated: redirect.lastUpdated,
        createdAt: redirect.createdAt
      }
    });
  } catch (error) {
    console.error('Error getting redirect:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving redirect',
      error: error.message
    });
  }
};

/**
 * Update a redirect
 */
exports.updateRedirect = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { targetUrl, isActive } = req.body;
    
    // Find the redirect
    const redirect = await Redirect.findOne({ 
      where: { id, UserId: req.user.id } 
    });
    
    if (!redirect) {
      return res.status(404).json({
        success: false,
        message: 'Redirect not found or you do not have permission to update it'
      });
    }
    
    // Update target URL if provided
    if (targetUrl) {
      // Validate URL format
      try {
        new URL(targetUrl);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid target URL'
        });
      }
      
      redirect.targetUrl = targetUrl;
      
      // Update HTML file with new target URL
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting to ${targetUrl}</title>
  <meta http-equiv="refresh" content="0; URL=${targetUrl}">
  <link rel="canonical" href="${targetUrl}">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      text-align: center;
      padding: 50px;
      background-color: #f8f9fa;
      color: #212529;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    a {
      color: #007bff;
      text-decoration: none;
    }
    .powered-by {
      margin-top: 40px;
      font-size: 0.8rem;
      color: #6c757d;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Redirecting...</h1>
    <p>If you are not redirected automatically, <a href="${targetUrl}">click here</a>.</p>
    <div class="powered-by">Powered by <a href="https://sriox.com">sriox.com</a></div>
  </div>
</body>
</html>
      `;
      
      await fs.writeFile(redirect.path, htmlContent);
    }
    
    // Update active status if provided
    if (isActive !== undefined) {
      redirect.isActive = isActive;
    }
    
    redirect.lastUpdated = new Date();
    await redirect.save({ transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Redirect updated successfully',
      redirect: {
        id: redirect.id,
        name: redirect.name,
        url: `https://sriox.com/${redirect.name}`,
        targetUrl: redirect.targetUrl,
        isActive: redirect.isActive,
        lastUpdated: redirect.lastUpdated
      }
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating redirect:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating redirect',
      error: error.message
    });
  }
};

/**
 * Delete a redirect
 */
exports.deleteRedirect = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Find the redirect
    const redirect = await Redirect.findOne({ 
      where: { id, UserId: req.user.id } 
    });
    
    if (!redirect) {
      return res.status(404).json({
        success: false,
        message: 'Redirect not found or you do not have permission to delete it'
      });
    }
    
    // Delete HTML file
    if (await fs.pathExists(redirect.path)) {
      await fs.unlink(redirect.path);
    }
    
    // Delete redirect record
    await redirect.destroy({ transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Redirect deleted successfully'
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting redirect:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting redirect',
      error: error.message
    });
  }
};