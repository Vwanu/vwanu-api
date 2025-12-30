/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-vars */
import '@feathersjs/transport-commons';
import { HookContext } from '@feathersjs/feathers';
import { Application } from './declarations';

export default function (app: Application): void {
  if (typeof app.channel !== 'function') {
    // If no real-time functionality has been configured just return
    return;
  }

  app.on('connection', (connection: any): void => {
    const user = connection.user;
    if (user)
      app.channel('authenticated').join(connection);
  });
  app.on('disconnect', (connection: any): void => {
    if (connection) {
     app.channel('authenticated').leave(connection);
    //   const { User } = connection;
    //   if (User)
        // app
        //   .service('users')
        //   .patch(User.id, { online: false, lastSeen: Date.now() });
    }
  });

  app.on('login', (authResult: any, { connection }: any): void => {
    console.log('[WebSocket] User login event (REST):', {
      userId: authResult?.user?.id || authResult?.User?.id,
      hasConnection: !!connection,
      timestamp: new Date().toISOString()
    });
    // connection can be undefined if there is no
    // real-time connection, e.g. when logging in via REST
    // Note: Socket connections are authenticated via socket middleware,
    // this event is mainly for REST-based authentication
    if (connection) {
      const { User } = connection;
      console.log('[WebSocket] REST login - updating channels:', {
        userId: User?.id,
        connectionId: connection.id
      });

      app.channel('anonymous').leave(connection);
      app.channel('authenticated').join(connection);
      app.channel(`userIds-${User.id}`).join(connection);
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.publish((_data: any, _hook: HookContext) => {
    // Here you can add event publishers to channels set up in `channels.ts`
    // To publish only for a specific event use `app.publish(eventname, () => {})`

    // Default: publish all events to all authenticated users
    // Individual services can override this with their own publish handlers
    return app.channel('authenticated');
  });

  // Here you can also add service specific event publishers
  // e.g. the publish the `users` service `created` event to the `admins` channel
  // app.service('users').publish('created', () => app.channel('admins'));

  // With the userid and email organization from above you can easily select involved users
  // app.service('messages').publish(() => {
  //   return [
  //     app.channel(`userIds/${data.createdBy}`),
  //     app.channel(`emails/${data.recipientEmail}`)
  //   ];
  // });
}
