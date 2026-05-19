import { ServiceAddons } from '@feathersjs/feathers';

/** Local dependencies */
import hooks from './posts.hook';
import { Posts } from './posts.class';
import { PostKore } from '../post-kore/post-kore.class';
import requireLogin from '../../middleware/requireLogin';
import { Application } from '../../declarations';
import { Post } from '../../database/post';

// Add this service to the service type index
declare module '../../declarations' {
  // eslint-disable-next-line no-unused-vars
  interface ServiceTypes {
    posts: Posts & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: Post,
    paginate: app.get('paginate'),
  };

  // Direct registration — no multer/multipart middleware. Post media land
  // via the presign flow handled by createFromMediaKeys in posts.class.ts
  // (clients send mediaKeys in the JSON body of POST /posts).
  app.use('/posts', new Posts(options, app));

  const service = app.service('posts');
  service.hooks(hooks);

  app.use('/posts/:postId/kore', requireLogin, new PostKore(options, app));
}
