// Initializes the `albums ` service on path `/albums`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Albums } from './albums.class';
import hooks from './albums.hooks';
import transferUploadedFilesToFeathers from '../../middleware/PassFilesToFeathers/file-to-feathers.middleware';
import { albumStorage } from '../../cloudinary';

// Add this service to the service type index
declare module '../../declarations' {
  // eslint-disable-next-line no-unused-vars
  interface ServiceTypes {
    albums: Albums & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: app.get('sequelizeClient').models.Album,
    paginate: app.get('paginate'),
  };

  app.use(
    '/albums',
    albumStorage.fields([
      { name: 'album-photo', maxCount: 1 },
      { name: 'album-video', maxCount: 1 },
    ]),
    transferUploadedFilesToFeathers,
    new Albums(options, app)
  );

  // Get our initialized service so that we can register hooks
  const service = app.service('albums');

  service.hooks(hooks);
}
