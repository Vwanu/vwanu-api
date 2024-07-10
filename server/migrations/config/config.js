const config = require('config');

const env = process.env?.NODE_ENV?.trim() || 'development';
const dbSettings = config.get('dbSettings');

module.exports = {
  [env]: {
    ...dbSettings,
    host: env === 'test' ? '127.0.0.1' : dbSettings.host,
    pool: { idle: 20000, acquire: 600000 },
    killConnections: false,
  },
};
