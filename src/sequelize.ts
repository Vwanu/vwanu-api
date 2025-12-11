/* eslint-disable @typescript-eslint/no-var-requires */
import config from 'config';
import { Sequelize, SequelizeOptions } from 'sequelize-typescript';

import Models from './database';
import { Application } from './declarations';
import {DBConfigurationType} from './schema/serverConf.schema';

const dbSettings = config.get<DBConfigurationType>('dbSettings');

interface  Options  extends SequelizeOptions{
  logging: boolean;
};

export default function (app: Application): void {

  // Log database connection settings for debugging (mask password)
  console.log('🔌 Database connection settings:', {
    host: dbSettings.host,
    port: dbSettings.port,
    database: dbSettings.database,
    username: dbSettings.username,
    password: dbSettings.password ? '***' + dbSettings.password.slice(-4) : 'NOT_SET',
    dialect: dbSettings.dialect,
    url: dbSettings.url ? 'SET (using connection URL)' : 'NOT_SET'
  });

  const options: Options = {
    ...dbSettings,
    logging: false,
    // @ts-ignore
    // define: {
    //   underscored: true,
    // },
  };

  const sequelize = dbSettings.url
    ? new Sequelize(dbSettings.url, options)
    : new Sequelize(options);

  sequelize.addModels(Models);

  // Test database connection and log result
  sequelize.authenticate()
    .then(() => {
      console.log('✅ Database connection verified successfully');
      console.log(`   Connected to: ${dbSettings.host}:${dbSettings.port}/${dbSettings.database}`);
    })
    .catch((error) => {
      console.error('❌ Database connection verification failed:');
      console.error('   Error:', error.message);
      console.error('   Code:', error.code || 'N/A');
      console.error('   Attempted connection:', {
        host: dbSettings.host,
        port: dbSettings.port,
        database: dbSettings.database,
        username: dbSettings.username
      });
    });

  app.set('sequelizeClient', sequelize as Sequelize);
}
