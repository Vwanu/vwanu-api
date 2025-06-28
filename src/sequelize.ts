import config from 'config';
import { Model } from 'sequelize';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Sequelize = require('sequelize').Sequelize;

import { Application } from './declarations';

const dbSettings = config.get('dbSettings');

let dbs = { ...dbSettings };
if (process.env.NODE_ENV === 'test') {
  dbs.host = 'localhost';
}

// console.log('[dbs] settings', dbs);
if (process.env.NODE_ENV === 'development') {
  dbs = {
    dialect: 'postgres',
    pool: { idle: 20000, acquire: 600000 },
    database: process.env.PGDATABASE,
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.DB_HOST,
    port: process.env.PGPORT,
    // dialectOptions: {
    //   ssl: {
    //     require: true,
    //     rejectUnauthorized: false,
    //   }
    // }
  };
  // console.log('[dbs --12] settings', dbs);
}

export default function (app: Application): void {
  const sequelize = dbSettings.url
    ? new Sequelize(dbSettings.url)
    : new Sequelize({
        logging: false,
        ...dbs,
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

    const syncOptions =
      process.env.NODE_ENV === 'development' ? { alter: true } : {};
    app.set('sequelizeSync', sequelize.sync(syncOptions));

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
