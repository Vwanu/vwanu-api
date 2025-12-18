import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';


export class CommunityRole extends Service {
  app;

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app=app
  }
}
