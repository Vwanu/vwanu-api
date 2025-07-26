import { ServiceAddons } from '@feathersjs/feathers';
/** Local dependencies */
import { Users } from './users.class';
import hooks from './users.hooks';
import { Application } from '../../declarations';
import { profilesStorage } from '../../cloudinary';
import fileToFeathers from '../../middleware/PassFilesToFeathers/file-to-feathers.middleware';
import { User } from '../../database/user';

declare module '../../declarations' {
  // eslint-disable-next-line no-unused-vars
  interface ServiceTypes {
    users: Users & ServiceAddons<any>;
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

  // Initialize our service with any options it requires
  app.use(
    '/users',
    profilesStorage.fields([
      { name: 'profilePicture', maxCount: 1 },
      { name: 'coverPicture', maxCount: 1 },
    ]),
    fileToFeathers,
    new Users(options, app),
  );
  const service = app.service('users');
  service.hooks(hooks);
}
