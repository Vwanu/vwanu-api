import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';

let serviceId = null;
// eslint-disable-next-line import/prefer-default-export
export class BlogKorem extends Service {
  app;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async create(data) {
    serviceId = serviceId ||
      (await this.
        app
        .get('sequelizeClient')
        .models
        .services
        .findOrCreate(
          { where: { name: 'Blog' }, defaults: { name: 'Blog' } }
        ))[0].id;
    const { UserId, entityId } = data;
    const { Korem } = this.app.get('sequelizeClient').models;
    console.log({UserId, entityId, serviceId});

    try {
      const [result, created] = await Korem.findOrCreate({
        where: { UserId, entityId },
        default: { ...data },
      });

      console.log('Result', result);
      console.log('Created', created);

      if (!created) await result.destroy();

      return Promise.resolve({
        entityId: result.entityId,
        createdAt: result.createdAt,
        UserId: result.UserId,
        created,
      });
    } catch (e) {
      console.log('Error', e);
      return Promise.reject(e);
    }
  }
}
