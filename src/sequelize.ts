import config from 'config';
import { Model } from 'sequelize';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Sequelize = require('sequelize').Sequelize;

import { Application } from './declarations';

const dbSettings = config.get('dbSettings');

console.log('dbSettings', dbSettings);
console.log('Environment check - DB_USER:', process.env.DB_USER);
console.log('Environment check - DB_PASSWORD:', process.env.DB_PASSWORD);
export default function (app: Application): void {
  const sequelize = dbSettings.url
    ? new Sequelize(dbSettings.url)
    : new Sequelize({
        logging: false,
        ...dbSettings,
        seederStorge: 'sequelize',
      });

  sequelize.query = async function (...args) {
    return await Sequelize.prototype.query.apply(this, args);
  };

  const oldSetup = app.setup;
  app.set('sequelizeClient', sequelize);

  // eslint-disable-next-line no-param-reassign
  app.setup = function (...args): Application {
    const result = oldSetup.apply(this, args);

    // Set up data relationships
    // Sync to the database

    // const syncOptions =
    //   process.env.NODE_ENV === 'development' ? { alter: false } : {};
    // Temporarily disable sync to test connection - provide a resolved promise instead
    app.set('sequelizeSync', Promise.resolve());

    return result;
  };
  function startSequelize() {
    const { models } = sequelize;
    Object.keys(models).forEach((name) => {
      if ('associate' in models[name]) {
        (models[name] as Model).associate?.(models);
      }
    });
  }
  app.set('startSequelize', startSequelize);
}
