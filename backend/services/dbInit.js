const { Plan } = require('../models');

/**
 * Initialize database with required data
 */
async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Create plans if they don't exist
    await initializePlans();
    
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Initialize plans
 */
async function initializePlans() {
  try {
    const plans = [
      {
        name: 'Free',
        maxSubdomains: 2,
        maxRedirects: 2,
        maxGithubPages: 2,
        maxUploadSize: 35 * 1024 * 1024, // 35MB in bytes
        allowCustomBranding: false,
        price: 0.00,
        isActive: true
      },
      {
        name: 'Pro',
        maxSubdomains: -1, // Unlimited (indicated by -1)
        maxRedirects: -1, // Unlimited
        maxGithubPages: -1, // Unlimited
        maxUploadSize: 35 * 1024 * 1024, // 35MB in bytes
        allowCustomBranding: true,
        price: 5.00, // $5.00/month
        isActive: true
      }
    ];
    
    for (const planData of plans) {
      const [plan, created] = await Plan.findOrCreate({
        where: { name: planData.name },
        defaults: planData
      });
      
      if (created) {
        console.log(`Created plan: ${plan.name}`);
      } else {
        console.log(`Plan already exists: ${plan.name}`);
        
        // Update plan if any changes
        await plan.update(planData);
      }
    }
    
    console.log('Plans initialization complete');
  } catch (error) {
    console.error('Error initializing plans:', error);
    throw error;
  }
}

module.exports = {
  initializeDatabase
};