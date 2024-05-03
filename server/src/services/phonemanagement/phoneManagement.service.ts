import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { PhoneManagement } from './phoneManagement.class';
import hooks from './phoneManagement.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  // eslint-disable-next-line no-unused-vars
  interface ServiceTypes {
    phonemanagement: PhoneManagement & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const sequelize = app.get('sequelizeClient');
  const options = {
    Model: sequelize.models.User,
    paginate: app.get('paginate'),
  };

  // Initialize our service with any options it requires
  app.use('/phonemanagement', new PhoneManagement(options, app));

  const service = app.service('phonemanagement');
  service.hooks(hooks);
}
