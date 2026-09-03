import { ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../declarations';
import { DeviceTokensService } from './device-tokens.class';
import hooks from './device-tokens.hooks';
import requireLogin from '../../middleware/requireLogin';

declare module '../../declarations' {
  // eslint-disable-next-line no-unused-vars
  interface ServiceTypes {
    'device-tokens': DeviceTokensService & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  app.use('/device-tokens', requireLogin, new DeviceTokensService(app));

  const service = app.service('device-tokens');
  service.hooks(hooks);
}
