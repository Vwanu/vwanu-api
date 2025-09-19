import { ServiceAddons } from '@feathersjs/feathers';

/** Local dependencies */
import hooks from './posts.hook';
import { Posts } from './posts.class';
import { PostKore } from '../post-kore/post-kore.class';
import { postStorage } from '../../storage/s3';
import { Application } from '../../declarations';
import transferUploadedFilesToFeathers from '../../middleware/PassFilesToFeathers/file-to-feathers.middleware';
import requireLogin from '../../middleware/requireLogin';
import {
  MEDIA_CONFIG_SCHEMA,
  MEDIA_CONFIG_TYPE,
} from '../../schema/mediaConf.schema';
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

  const configuration: MEDIA_CONFIG_TYPE = app.get('MEDIA_CONFIGURATION');
  
  // Debug middleware to log incoming data
  const debugMiddleware = (req: any, res: any, next: any) => {
    console.log('=== POSTS SERVICE DEBUG START ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    console.log('Query:', req.query);
    console.log('Params:', req.params);
    console.log('========================');
    next();
  };
  
  if (MEDIA_CONFIG_SCHEMA.parse(configuration)) {
    // Initialize our service with any options it requires
    app.use(
      '/posts',
      debugMiddleware, // Add debug middleware first
      postStorage.fields([
        { name: 'postImage', maxCount: configuration.maxPostImages },
        { name: 'postVideo', maxCount: configuration.maxPostVideos },
        { name: 'postAudio', maxCount: configuration.maxPostAudios },
      ]),
      transferUploadedFilesToFeathers,
      new Posts(options, app),
    );

    const service = app.service('posts');
    service.hooks(hooks);

    app.use('/posts/:postId/kore', requireLogin, new PostKore(options, app));
  }
}
