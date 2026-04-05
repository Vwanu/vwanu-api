const config = require('config');

const env = process.env?.NODE_ENV?.trim() || 'development';

const isLocal = !process.env.DB_HOST || process.env.DB_HOST === 'localhost';

const dbSettings = {
  username: process.env.DB_USER || 'vwanu',
  password: process.env.DB_PASSWORD || '1234567890',
  database: process.env.DB_DATABASE || 'social-media-api',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  dialectOptions: isLocal ? {} : {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
};

module.exports = {
  [env]: {
    ...dbSettings,
  },
};
