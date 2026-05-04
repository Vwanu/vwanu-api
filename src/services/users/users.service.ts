import { ServiceAddons } from '@feathersjs/feathers';
/** Local dependencies */
import hooks from './users.hooks';
import { Users } from './users.class';
import { User } from '../../database/user';
import { Application } from '../../declarations';

declare module '../../declarations' {
  // eslint-disable-next-line no-unused-vars
  interface ServiceTypes {
    users: Users & ServiceAddons<Users>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: User,
    paginate: {
      default: 10,
      max: 50,
    },
  };

  // Direct registration — no multer/multipart middleware. Profile/cover
  // pictures land via the presign flow handled by applyProfileMediaKeys
  // in users.hooks.ts (clients PATCH with profilePictureKey/coverPictureKey).
  app.use('/users', new Users(options, app));
  const service = app.service('users');
  service.hooks(hooks);
}
