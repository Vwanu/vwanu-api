import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Followers } from './followers.class';
import {UserFollower} from '../../database/user-follower'
import hooks from './followers.hook';

declare module '../../declarations' {
  interface ServiceTypes {
    followers: Followers & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: UserFollower,
    paginate: app.get('paginate'),
  };

  app.use('/followers', new Followers(options, app));
  const service: any = app.service('followers');
  service.hooks(hooks);
}
