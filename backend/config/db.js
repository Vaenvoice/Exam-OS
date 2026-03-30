const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  (process.env.DB_NAME || '').trim(),
  (process.env.DB_USER || '').trim(),
  (process.env.DB_PASSWORD || '').trim(),
  {
    host: (process.env.DB_HOST || '').trim(),
    port: parseInt((process.env.DB_PORT || '5432').trim()),
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;
