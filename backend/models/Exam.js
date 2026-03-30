const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Exam = sequelize.define('Exam', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  duration: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: false
  },
  creatorId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  startWindow: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endWindow: {
    type: DataTypes.DATE,
    allowNull: true
  },
  randomizeQuestions: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Exam;
