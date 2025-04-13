const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize with PostgreSQL
const sequelize = new Sequelize(
  process.env.DB_NAME || 'sriox',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

// Import models
const User = require('./User')(sequelize);
const Site = require('./Site')(sequelize);
const Redirect = require('./Redirect')(sequelize);
const GithubPage = require('./GithubPage')(sequelize);
const Plan = require('./Plan')(sequelize);
const Subscription = require('./Subscription')(sequelize);

// Associations
User.hasMany(Site);
User.hasMany(Redirect);
User.hasMany(GithubPage);
Site.belongsTo(User);
Redirect.belongsTo(User);
GithubPage.belongsTo(User);

User.hasOne(Subscription);
Subscription.belongsTo(User);
Plan.hasMany(Subscription);
Subscription.belongsTo(Plan);

module.exports = {
  sequelize,
  User,
  Site,
  Redirect,
  GithubPage,
  Plan,
  Subscription
};