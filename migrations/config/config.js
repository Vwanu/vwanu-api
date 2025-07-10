const config = require('config');

const env = process.env?.NODE_ENV?.trim() || 'development';

const dbSettings = {
  username: process.env.DB_USER || 'vwanu',
  password: process.env.DB_PASSWORD || '1234567890',
  database: process.env.DB_DATABASE || 'social-media-api',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  dialectOptions: {
    ssl: false
  }
};

module.exports = {
  [env]: {
    ...dbSettings,
  },
};
