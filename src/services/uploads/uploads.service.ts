import { ServiceAddons } from '@feathersjs/feathers';

import { Application } from '../../declarations';
import { UploadsService } from './uploads.class';
import hooks from './uploads.hooks';
import requireLogin from '../../middleware/requireLogin';

declare module '../../declarations' {
  // eslint-disable-next-line no-unused-vars
  interface ServiceTypes {
    'uploads/presign': UploadsService & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  app.use('/uploads/presign', requireLogin, new UploadsService(app));

  const service = app.service('uploads/presign');
  service.hooks(hooks);
}
