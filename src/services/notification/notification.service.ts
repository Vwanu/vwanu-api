import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Notification } from './notification.class';
import hooks from './notification.hooks';
import { Notification as NotificationModel } from '../../database/notification';
// import  { RealTimeConnection } from '@feathersjs/feathers'

// Add this service to the service type index
declare module '../../declarations' {
  // eslint-disable-next-line no-unused-vars
  interface ServiceTypes {
    notifications: Notification & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: NotificationModel,
    paginate: app.get('paginate'),
  };

  // Initialize our service with any options it requires
  app.use('/notifications', new Notification(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('notifications');

  service.publish('created', (data:NotificationModel, context) =>{
    console.log('[Notification Created] Publishing to user channel:', data.userId);
    return app.channel('authenticated').filter((connection) => {
      return connection.user && connection.user.id === data.userId;
    });
  });

  service.hooks(hooks);
}
