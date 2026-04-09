const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Assignment = sequelize.define('Assignment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ExamId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  UserId: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  indexes: [
    { fields: ['ExamId'] },
    { fields: ['UserId'] }
  ]
});

module.exports = Assignment;
