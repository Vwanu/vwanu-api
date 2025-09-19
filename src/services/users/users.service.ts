import { ServiceAddons } from '@feathersjs/feathers';
import { Request, Response, NextFunction } from 'express';
/** Local dependencies */
import { Users } from './users.class';
import hooks from './users.hooks';
import { Application } from '../../declarations';
import { profileStorage } from '../../storage/s3';
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

  // Debug middleware for profile picture uploads
  const debugMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log('=== USERS SERVICE DEBUG START ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Files:', req.files);
    console.log('Body:', req.body);
    console.log('=========================');
    next();
  };

  // Initialize our service with any options it requires
  app.use(
    '/users',
    debugMiddleware, // Add debug middleware
    profileStorage.fields([
      { name: 'profilePicture', maxCount: 1 },
      { name: 'coverPicture', maxCount: 1 },
    ]),
    fileToFeathers,
    new Users(options, app),
  );
  const service = app.service('users');
  service.hooks(hooks);
}
