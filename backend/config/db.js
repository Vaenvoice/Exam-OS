const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

let sequelize;

if (process.env.DATABASE_URL) {
  // Render PostgreSQL (or any connection string)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Required for Render's free Postgres
      },
    },
    pool: {
      max: 20,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
  });
} else {
  // Local development — individual env vars
  sequelize = new Sequelize(
    (process.env.DB_NAME || '').trim(),
    (process.env.DB_USER || '').trim(),
    (process.env.DB_PASSWORD || '').trim(),
    {
      host: (process.env.DB_HOST || '').trim(),
      port: parseInt((process.env.DB_PORT || '5432').trim()),
      dialect: 'postgres',
      logging: false,
      pool: {
        max: 20,
        min: 2,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}

module.exports = sequelize;

