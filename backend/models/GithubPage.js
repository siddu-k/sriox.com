const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const GithubPage = sequelize.define('GithubPage', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    subdomain: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: /^[a-z0-9-]+$/i  // Allow alphanumeric and hyphen only
      }
    },
    githubUsername: {
      type: DataTypes.STRING,
      allowNull: false
    },
    repository: {
      type: DataTypes.STRING,
      allowNull: false
    },
    customDomain: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastUpdated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });
  
  return GithubPage;
};