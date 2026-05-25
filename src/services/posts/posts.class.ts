import { Service, SequelizeServiceOptions } from 'feathers-sequelize';

import { Application } from '../../declarations';
import { createFromMediaKeys } from './lib/createFromMediaKeys';

export class Posts extends Service {
  app;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async create(data, params) {
    return createFromMediaKeys(this.app, data, params);
  }
}
