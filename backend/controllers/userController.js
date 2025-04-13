const { User, Subscription, Plan, Site, Redirect, GithubPage } = require('../models');
const bcrypt = require('bcrypt');
const { sequelize } = require('../models');

/**
 * Get user profile
 */
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Subscription,
          include: [Plan]
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        subscription: user.Subscription ? {
          id: user.Subscription.id,
          status: user.Subscription.status,
          plan: {
            name: user.Subscription.Plan.name,
            maxSubdomains: user.Subscription.Plan.maxSubdomains,
            maxRedirects: user.Subscription.Plan.maxRedirects,
            maxGithubPages: user.Subscription.Plan.maxGithubPages,
            maxUploadSize: user.Subscription.Plan.maxUploadSize,
            allowCustomBranding: user.Subscription.Plan.allowCustomBranding
          },
          startDate: user.Subscription.startDate,
          endDate: user.Subscription.endDate,
          nextPaymentDate: user.Subscription.nextPaymentDate
        } : null
      }
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user profile',
      error: error.message
    });
  }
};

/**
 * Update user profile
 */
exports.updateUserProfile = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { username, email } = req.body;
    
    // Find the user
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update username if provided
    if (username && username !== user.username) {
      // Check if username already exists
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Username already taken'
        });
      }
      user.username = username;
    }
    
    // Update email if provided
    if (email && email !== user.email) {
      // Check if email already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered'
        });
      }
      user.email = email;
      user.isVerified = false; // Require re-verification with new email
    }
    
    await user.save({ transaction });
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user profile',
      error: error.message
    });
  }
};

/**
 * Change user password
 */
exports.changePassword = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    // Find the user
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password
    const passwordMatch = await user.comparePassword(currentPassword);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save({ transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

/**
 * Get user statistics
 */
exports.getUserStats = async (req, res) => {
  try {
    // Count user's sites, redirects, and GitHub Pages
    const [sites, redirects, githubPages] = await Promise.all([
      Site.count({ where: { UserId: req.user.id } }),
      Redirect.count({ where: { UserId: req.user.id } }),
      GithubPage.count({ where: { UserId: req.user.id } })
    ]);
    
    // Get user's subscription and plan
    const subscription = await Subscription.findOne({
      where: { UserId: req.user.id, status: 'active' },
      include: [Plan]
    });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }
    
    const plan = subscription.Plan;
    
    res.status(200).json({
      success: true,
      stats: {
        sites: {
          used: sites,
          limit: plan.maxSubdomains,
          percentage: (sites / plan.maxSubdomains) * 100
        },
        redirects: {
          used: redirects,
          limit: plan.maxRedirects,
          percentage: (redirects / plan.maxRedirects) * 100
        },
        githubPages: {
          used: githubPages,
          limit: plan.maxGithubPages,
          percentage: (githubPages / plan.maxGithubPages) * 100
        }
      },
      plan: {
        name: plan.name,
        isPro: plan.name === 'Pro'
      }
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user statistics',
      error: error.message
    });
  }
};

/**
 * Upgrade user plan
 */
exports.upgradeUserPlan = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { planId, paymentMethod, paymentToken } = req.body;
    
    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID is required'
      });
    }
    
    // Find the plan
    const plan = await Plan.findByPk(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found or not available'
      });
    }
    
    // Find user's current subscription
    const currentSubscription = await Subscription.findOne({
      where: { UserId: req.user.id, status: 'active' }
    });
    
    // If user already has the same plan
    if (currentSubscription && currentSubscription.PlanId === planId) {
      return res.status(400).json({
        success: false,
        message: 'You are already subscribed to this plan'
      });
    }
    
    // Process payment (placeholder - implementation depends on payment provider)
    // In a real application, you would integrate with a payment gateway like Stripe
    let paymentSuccessful = true;
    let paymentId = 'sample_payment_id';
    
    if (plan.price > 0 && (!paymentMethod || !paymentToken)) {
      return res.status(400).json({
        success: false,
        message: 'Payment method and token are required for paid plans'
      });
    }
    
    if (!paymentSuccessful) {
      return res.status(400).json({
        success: false,
        message: 'Payment processing failed'
      });
    }
    
    // If user has an existing subscription, deactivate it
    if (currentSubscription) {
      currentSubscription.status = 'canceled';
      currentSubscription.endDate = new Date();
      await currentSubscription.save({ transaction });
    }
    
    // Create new subscription
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const subscription = await Subscription.create({
      UserId: req.user.id,
      PlanId: plan.id,
      status: 'active',
      startDate: new Date(),
      paymentMethod: plan.price > 0 ? paymentMethod : null,
      paymentId: plan.price > 0 ? paymentId : null,
      lastPaymentDate: plan.price > 0 ? new Date() : null,
      nextPaymentDate: plan.price > 0 ? nextMonth : null
    }, { transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: `Successfully upgraded to ${plan.name} plan`,
      subscription: {
        id: subscription.id,
        plan: {
          id: plan.id,
          name: plan.name,
          price: plan.price,
          maxSubdomains: plan.maxSubdomains,
          maxRedirects: plan.maxRedirects,
          maxGithubPages: plan.maxGithubPages,
          maxUploadSize: plan.maxUploadSize,
          allowCustomBranding: plan.allowCustomBranding
        },
        startDate: subscription.startDate,
        status: subscription.status,
        nextPaymentDate: subscription.nextPaymentDate
      }
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error upgrading plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error upgrading plan',
      error: error.message
    });
  }
};