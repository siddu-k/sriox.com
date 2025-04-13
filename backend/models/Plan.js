const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Plan = sequelize.define('Plan', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    maxSubdomains: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2  // Free plan default
    },
    maxRedirects: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2  // Free plan default
    },
    maxGithubPages: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2  // Free plan default
    },
    maxUploadSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 35 * 1024 * 1024  // 35MB in bytes
    },
    allowCustomBranding: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00  // Free plan default
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });
  
  return Plan;
};