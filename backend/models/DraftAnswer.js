const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DraftAnswer = sequelize.define('DraftAnswer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  UserId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  ExamId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  answers: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
  },
  tabSwitchCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  startedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  lastSavedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['UserId', 'ExamId']
    }
  ]
});

module.exports = DraftAnswer;
