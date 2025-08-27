// Sequelize model for CMS Adapter (order mapping)
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'swiftdb',
  process.env.DB_USER || 'swift',
  process.env.DB_PASS || 'swift',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

const CMSOrder = sequelize.define('CMSOrder', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  cmsRef: DataTypes.STRING,
  payload: DataTypes.JSONB,
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
});

module.exports = { sequelize, CMSOrder };
