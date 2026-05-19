
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Blogs } from './blogs.class';
import hooks from './blogs.hooks';
import updateTheTSVector from '../search/tsquery-and-search.hook';
import { Blog as BlogModel } from '../../database/blog';

// Add this service to the service type index
declare module '../../declarations' {
  // eslint-disable-next-line no-unused-vars
  interface ServiceTypes {
    blogs: Blogs & ServiceAddons<Blogs>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: BlogModel,
    paginate: app.get('paginate'),
  };


  // Direct registration — no multer/multipart middleware. The blog title
  // picture lands via the presign flow handled by applyBlogMediaKeys in
  // blogs.hooks.ts (clients send titlePictureKey in the JSON body of
  // POST/PATCH /blogs).
  app.use('/blogs', new Blogs(options, app));
  // Get our initialized service so that we can register hooks
  const service = app.service('blogs');
  service.hooks({
    before: { ...hooks.before },
    after: {
      ...hooks.after,
      create: [
        ...hooks.after.create,
        updateTheTSVector({
          model: BlogModel,
          searchColumn: 'search_vector',
        }),
      ],
      update: [
        updateTheTSVector({
          model: BlogModel,
          searchColumn: 'search_vector',
        }),
      ],
      patch: [
        updateTheTSVector({
          model: BlogModel,
          searchColumn: 'search_vector',
        }),
      ],
    },
  });
}
