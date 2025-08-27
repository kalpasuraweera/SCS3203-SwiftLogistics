// Sequelize model for Delivery Service (delivery actions)
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

const Delivery = sequelize.define('Delivery', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  driverId: DataTypes.STRING,
  orderId: DataTypes.STRING,
  status: DataTypes.STRING, // delivered, failed, etc.
  reason: DataTypes.STRING, // if failed
  signature: DataTypes.STRING, // base64 or file ref
  photo: DataTypes.STRING, // file ref
  timestamp: DataTypes.DATE,
  payload: DataTypes.JSONB,
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
});

module.exports = { sequelize, Delivery };
