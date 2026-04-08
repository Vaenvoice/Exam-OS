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
        rejectUnauthorized: false,
      },
      connectTimeout: 60000 // 60s for Neon cold starts
    },
    pool: {
      max: 10, // Lowered for Neon free tier (20 total connections allowed)
      min: 0,
      acquire: 60000,
      idle: 10000,
      evict: 1000, // Check for idle connections every second
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
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}

module.exports = sequelize;

