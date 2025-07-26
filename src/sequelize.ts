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

  const options: Options = {
    ...dbSettings,
    logging: false,
  };

  const sequelize = dbSettings.url
    ? new Sequelize(dbSettings.url, options)
    : new Sequelize(options);

  sequelize.addModels(Models);

  app.set('sequelizeClient', sequelize as Sequelize);
}
