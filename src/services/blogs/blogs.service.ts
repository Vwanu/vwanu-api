
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Blogs } from './blogs.class';
import { BlogKore } from '../blog-korem/blog-kore.class';
import hooks from './blogs.hooks';
import transferUploadedFilesToFeathers from '../../middleware/PassFilesToFeathers/file-to-feathers.middleware';
import { blogStorage } from '../../storage/s3';
import updateTheTSVector from '../search/tsquery-and-search.hook';
import { Blog as BlogModel } from '../../database/blog';
import requireLogin from '../../middleware/requireLogin';

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


  // Initialize our service with any options it requires
  app.use(
    '/blogs',
    blogStorage.fields([{ name: 'titlePicture', maxCount: 1 }]),
    transferUploadedFilesToFeathers,
    new Blogs(options, app)
  );
  // Get our initialized service so that we can register hooks
  const service = app.service('blogs');

  app.use('/blogs/:blogId/kore', requireLogin, new BlogKore(options, app));
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
