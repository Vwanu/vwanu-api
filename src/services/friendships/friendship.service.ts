
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Friendship } from './friendship.class';
import hooks from './friendship.hook';
import { Friendship as FriendshipModel } from '../../database/friendship';

// Add this service to the service type index
declare module '../../declarations' {
  // eslint-disable-next-line no-unused-vars
  interface ServiceTypes {
    friendship: Friendship & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: FriendshipModel,
    paginate: app.get('paginate'),
    multi: ['remove'],
  };

  app.use('/friendship', new Friendship(options, app));
  const service = app.service('friendship');
  service.hooks(hooks);
   service.publish('created', (data:FriendshipModel) =>{
      // letting the user know they have a new friend request
      return app.channel('authenticated').filter((connection) => {
        return connection.user && connection.user.id === data.targetId;
      });
    });

    service.publish('patched', (data:FriendshipModel) =>{
      // letting the user know their friend request was accepted
      return app.channel('authenticated').filter((connection) => {
        return connection.user
        && connection.user.id === data.userId
        || connection.user.id === data.targetId;
      });
    });
}
