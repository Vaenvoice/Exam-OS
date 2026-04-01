const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Result = sequelize.define('Result', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  percentage: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  browserData: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  indexes: [
    { fields: ['UserId'] },
    { fields: ['ExamId'] },
    { fields: ['submittedAt'] },
    { fields: ['isApproved'] }
  ]
});

module.exports = Result;
