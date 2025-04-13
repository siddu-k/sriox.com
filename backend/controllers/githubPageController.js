const { GithubPage, User, Subscription, Plan } = require('../models');
const { sequelize } = require('../models');
const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');
const cloudflare = require('cloudflare')({
  token: process.env.CLOUDFLARE_API_TOKEN
});

/**
 * Create a new GitHub Pages mapping
 */
exports.createGithubPageMapping = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { subdomain, githubUsername, repository } = req.body;
    
    if (!subdomain || !githubUsername || !repository) {
      return res.status(400).json({
        success: false,
        message: 'Subdomain, GitHub username, and repository are required'
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
    const existingMapping = await GithubPage.findOne({ 
      where: { subdomain } 
    });
    
    if (existingMapping) {
      return res.status(409).json({
        success: false,
        message: 'This subdomain is already taken'
      });
    }
    
    // Check user's GitHub Pages mapping count limit
    const userMappingsCount = await GithubPage.count({ 
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
    
    // Check if user can create more GitHub Pages mappings
    if (userMappingsCount >= plan.maxGithubPages) {
      return res.status(403).json({
        success: false,
        message: "You've reached your free GitHub Pages mapping limit. Please upgrade to Pro."
      });
    }
    
    // Verify that the GitHub repository exists
    try {
      const repoUrl = `https://api.github.com/repos/${githubUsername}/${repository}`;
      const response = await axios.get(repoUrl);
      
      if (response.status !== 200) {
        return res.status(404).json({
          success: false,
          message: 'GitHub repository not found'
        });
      }
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'GitHub repository not found or is private'
      });
    }
    
    // Create DNS record in Cloudflare (if credentials are available)
    let dnsRecord = null;
    if (process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ZONE_ID) {
      try {
        // Create CNAME record pointing to GitHub Pages
        const response = await cloudflare.dnsRecords.add(
          process.env.CLOUDFLARE_ZONE_ID,
          {
            type: 'CNAME',
            name: subdomain,
            content: `${githubUsername}.github.io`,
            ttl: 1, // Auto
            proxied: true
          }
        );
        
        dnsRecord = response.result;
      } catch (error) {
        console.error('Error creating Cloudflare DNS record:', error);
        // Continue with the process even if DNS record creation fails
        // The admin can manually set up DNS later
      }
    }
    
    // Create CNAME file for GitHub Pages custom domain
    const cnameDir = path.join(__dirname, '../../data/cname');
    await fs.ensureDir(cnameDir);
    
    const cnameContent = `${subdomain}.sriox.com`;
    const cnamePath = path.join(cnameDir, `${subdomain}.txt`);
    await fs.writeFile(cnamePath, cnameContent);
    
    // Create GitHub Pages mapping record in database
    const mapping = await GithubPage.create({
      subdomain,
      githubUsername,
      repository,
      customDomain: `${subdomain}.sriox.com`,
      UserId: req.user.id
    }, { transaction });
    
    await transaction.commit();
    
    res.status(201).json({
      success: true,
      message: 'GitHub Pages mapping created successfully',
      mapping: {
        id: mapping.id,
        subdomain: mapping.subdomain,
        url: `https://${mapping.subdomain}.sriox.com`,
        githubUsername: mapping.githubUsername,
        repository: mapping.repository,
        isVerified: mapping.isVerified,
        setupInstructions: [
          `1. Go to your repository at https://github.com/${githubUsername}/${repository}`,
          `2. Create a file called 'CNAME' in the root directory`,
          `3. Add the following content to the CNAME file: ${subdomain}.sriox.com`,
          `4. Go to repository Settings > Pages and ensure GitHub Pages is enabled`,
          `5. Your site should be available at https://${subdomain}.sriox.com once DNS propagates (up to 48 hours)`
        ]
      }
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating GitHub Pages mapping:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating GitHub Pages mapping',
      error: error.message
    });
  }
};

/**
 * Get all GitHub Pages mappings by user
 */
exports.getGithubPagesByUser = async (req, res) => {
  try {
    const mappings = await GithubPage.findAll({ 
      where: { UserId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: mappings.length,
      mappings: mappings.map(mapping => ({
        id: mapping.id,
        subdomain: mapping.subdomain,
        url: `https://${mapping.subdomain}.sriox.com`,
        githubUsername: mapping.githubUsername,
        repository: mapping.repository,
        githubUrl: `https://github.com/${mapping.githubUsername}/${mapping.repository}`,
        isVerified: mapping.isVerified,
        isActive: mapping.isActive,
        lastUpdated: mapping.lastUpdated,
        createdAt: mapping.createdAt
      }))
    });
  } catch (error) {
    console.error('Error getting GitHub Pages mappings:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving GitHub Pages mappings',
      error: error.message
    });
  }
};

/**
 * Get GitHub Pages mapping by subdomain
 */
exports.getGithubPageBySubdomain = async (req, res) => {
  try {
    const { subdomain } = req.params;
    
    const mapping = await GithubPage.findOne({ 
      where: { subdomain, isActive: true },
      include: [{
        model: User,
        attributes: ['username']
      }]
    });
    
    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: 'GitHub Pages mapping not found'
      });
    }
    
    res.status(200).json({
      success: true,
      mapping: {
        id: mapping.id,
        subdomain: mapping.subdomain,
        url: `https://${mapping.subdomain}.sriox.com`,
        githubUsername: mapping.githubUsername,
        repository: mapping.repository,
        githubUrl: `https://github.com/${mapping.githubUsername}/${mapping.repository}`,
        owner: mapping.User.username,
        isVerified: mapping.isVerified,
        isActive: mapping.isActive,
        lastUpdated: mapping.lastUpdated,
        createdAt: mapping.createdAt
      }
    });
  } catch (error) {
    console.error('Error getting GitHub Pages mapping:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving GitHub Pages mapping',
      error: error.message
    });
  }
};

/**
 * Update a GitHub Pages mapping
 */
exports.updateGithubPageMapping = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { githubUsername, repository, isActive } = req.body;
    
    // Find the mapping
    const mapping = await GithubPage.findOne({ 
      where: { id, UserId: req.user.id } 
    });
    
    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: 'GitHub Pages mapping not found or you do not have permission to update it'
      });
    }
    
    // Update fields if provided
    if (githubUsername && repository) {
      // Verify that the GitHub repository exists
      try {
        const repoUrl = `https://api.github.com/repos/${githubUsername}/${repository}`;
        const response = await axios.get(repoUrl);
        
        if (response.status !== 200) {
          return res.status(404).json({
            success: false,
            message: 'GitHub repository not found'
          });
        }
        
        mapping.githubUsername = githubUsername;
        mapping.repository = repository;
        
        // Update Cloudflare DNS record if needed and if credentials are available
        if (process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ZONE_ID) {
          try {
            // Find existing DNS records for this subdomain
            const dnsRecords = await cloudflare.dnsRecords.browse(process.env.CLOUDFLARE_ZONE_ID, {
              name: `${mapping.subdomain}.sriox.com`
            });
            
            if (dnsRecords && dnsRecords.result && dnsRecords.result.length > 0) {
              const recordId = dnsRecords.result[0].id;
              
              // Update the CNAME record to point to the new GitHub Pages
              await cloudflare.dnsRecords.edit(
                process.env.CLOUDFLARE_ZONE_ID,
                recordId,
                {
                  type: 'CNAME',
                  name: mapping.subdomain,
                  content: `${githubUsername}.github.io`,
                  ttl: 1, // Auto
                  proxied: true
                }
              );
            }
          } catch (error) {
            console.error('Error updating Cloudflare DNS record:', error);
            // Continue with the process even if DNS record update fails
          }
        }
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: 'GitHub repository not found or is private'
        });
      }
    }
    
    // Update active status if provided
    if (isActive !== undefined) {
      mapping.isActive = isActive;
    }
    
    mapping.lastUpdated = new Date();
    await mapping.save({ transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'GitHub Pages mapping updated successfully',
      mapping: {
        id: mapping.id,
        subdomain: mapping.subdomain,
        url: `https://${mapping.subdomain}.sriox.com`,
        githubUsername: mapping.githubUsername,
        repository: mapping.repository,
        githubUrl: `https://github.com/${mapping.githubUsername}/${mapping.repository}`,
        isVerified: mapping.isVerified,
        isActive: mapping.isActive,
        lastUpdated: mapping.lastUpdated
      }
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating GitHub Pages mapping:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating GitHub Pages mapping',
      error: error.message
    });
  }
};

/**
 * Delete a GitHub Pages mapping
 */
exports.deleteGithubPageMapping = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Find the mapping
    const mapping = await GithubPage.findOne({ 
      where: { id, UserId: req.user.id } 
    });
    
    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: 'GitHub Pages mapping not found or you do not have permission to delete it'
      });
    }
    
    // Delete DNS record in Cloudflare if credentials are available
    if (process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ZONE_ID) {
      try {
        // Find existing DNS records for this subdomain
        const dnsRecords = await cloudflare.dnsRecords.browse(process.env.CLOUDFLARE_ZONE_ID, {
          name: `${mapping.subdomain}.sriox.com`
        });
        
        if (dnsRecords && dnsRecords.result && dnsRecords.result.length > 0) {
          const recordId = dnsRecords.result[0].id;
          
          // Delete the DNS record
          await cloudflare.dnsRecords.del(process.env.CLOUDFLARE_ZONE_ID, recordId);
        }
      } catch (error) {
        console.error('Error deleting Cloudflare DNS record:', error);
        // Continue with the process even if DNS record deletion fails
      }
    }
    
    // Delete CNAME file if exists
    const cnamePath = path.join(__dirname, '../../data/cname', `${mapping.subdomain}.txt`);
    if (await fs.pathExists(cnamePath)) {
      await fs.unlink(cnamePath);
    }
    
    // Delete mapping record
    await mapping.destroy({ transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'GitHub Pages mapping deleted successfully'
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting GitHub Pages mapping:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting GitHub Pages mapping',
      error: error.message
    });
  }
};

/**
 * Verify GitHub Pages mapping ownership
 */
exports.verifyGithubPage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the mapping
    const mapping = await GithubPage.findOne({ 
      where: { id, UserId: req.user.id } 
    });
    
    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: 'GitHub Pages mapping not found or you do not have permission to verify it'
      });
    }
    
    // Verify that the CNAME file exists in the GitHub repository
    try {
      const cnameUrl = `https://raw.githubusercontent.com/${mapping.githubUsername}/${mapping.repository}/main/CNAME`;
      const response = await axios.get(cnameUrl);
      
      if (response.status === 200) {
        const cnameContent = response.data.trim();
        
        if (cnameContent === `${mapping.subdomain}.sriox.com`) {
          mapping.isVerified = true;
          await mapping.save();
          
          return res.status(200).json({
            success: true,
            message: 'GitHub Pages mapping verified successfully',
            isVerified: true
          });
        }
      }
      
      res.status(400).json({
        success: false,
        message: 'CNAME file not found or has incorrect content',
        isVerified: false,
        expectedContent: `${mapping.subdomain}.sriox.com`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'CNAME file not found in repository',
        isVerified: false,
        instructions: [
          `1. Go to your repository at https://github.com/${mapping.githubUsername}/${mapping.repository}`,
          `2. Create a file called 'CNAME' in the root directory`,
          `3. Add the following content to the CNAME file: ${mapping.subdomain}.sriox.com`,
          `4. Go to repository Settings > Pages and ensure GitHub Pages is enabled`
        ]
      });
    }
  } catch (error) {
    console.error('Error verifying GitHub Pages mapping:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying GitHub Pages mapping',
      error: error.message
    });
  }
};