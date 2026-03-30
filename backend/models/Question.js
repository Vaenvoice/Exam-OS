const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  questionText: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  optionA: {
    type: DataTypes.STRING,
    allowNull: false
  },
  optionB: {
    type: DataTypes.STRING,
    allowNull: false
  },
  optionC: {
    type: DataTypes.STRING,
    allowNull: false
  },
  optionD: {
    type: DataTypes.STRING,
    allowNull: false
  },
  correctAnswer: {
    type: DataTypes.ENUM('A', 'B', 'C', 'D'),
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = Question;
