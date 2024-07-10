import { ServiceAddons } from '@feathersjs/feathers';
import { createSwaggerServiceOptions , ServiceSwaggerOptions} from 'feathers-swagger';

/** Local dependencies */
import { Users } from './users.class';
import hooks from './users.hooks';
import { Application } from '../../declarations';
import { profilesStorage } from '../../cloudinary';
import updateTheTSVector from '../search/tsquery-and-search.hook';
import fileToFeathers from '../../middleware/PassFilesToFeathers/file-to-feathers.middleware';

declare module '../../declarations' {
  // eslint-disable-next-line no-unused-vars
  interface ServiceTypes {
    users: Users & ServiceAddons<any>;
  }
  // interface ServiceOptions{
  //   docs?:ServiceSwaggerOptions

  // }
}

export default function (app: Application): void {
  const sequelize = app.get('sequelizeClient');
  const UserModel = sequelize.models.User;
  const options = {
    Model: UserModel,
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
    // {
    //   methods: ['create', 'update', 'patch', 'remove'],
    //   events: [],
    //   docs: createSwaggerServiceOptions({
    //     schemas: {},
    //     docs: {
    //       description: 'My custom service description',
    //       securities: ['all'],
    //     }
    //   })
    // }
  );
  const service = app.service('users');

  service.hooks({
    before: { ...hooks.before },
    after: {
      ...hooks.after,
      create: [
        ...hooks.after.create,
        updateTheTSVector({
          model: UserModel,
          searchColumn: 'search_vector',
        }),
      ],
      update: [
        updateTheTSVector({
          model: UserModel,
          searchColumn: 'search_vector',
        }),
      ],
      patch: [
        ...hooks.after.patch,
        updateTheTSVector({
          model: UserModel,
          searchColumn: 'search_vector',
        }),
      ],
    },
  });
}
