const config = require('config');

const env = process.env?.NODE_ENV?.trim() || 'development';

const dbSettings = {
  username: process.env.PGUSER || 'vwanu',
  password: process.env.PGPASSWORD || '1234567890',
  database: process.env.PGDATABASE || 'social-media-api',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.PGPORT || 5432,
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
