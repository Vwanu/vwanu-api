// Initializes the `conversation` service on path `/conversation`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Conversation } from './conversation.class';
import { Conversation as ConversationType } from '../../database/conversation';
import { Message as MessageModel } from '../../database/message';
import {Message} from '../message/message.class'
import MessageHook from '../message/message.hooks'
import hooks from './conversation.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  // eslint-disable-next-line no-unused-vars
  interface ServiceTypes {
    conversation: Conversation & ServiceAddons<ConversationType>;
    ['conversation/:conversationId/messages']: MessageModel & ServiceAddons<MessageModel>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: ConversationType,
    paginate: app.get('paginate'),
  };

  // Initialize our service with any options it requires
  app.use('/conversation', new Conversation(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('conversation');
  // Sending notification to the receivers or the conversation

  service.publish('created', (conversation, context) => {
    console.log('[Conversation Created] Publishing to conversation channel:', conversation.id);
    return app.channel(`authenticated`);
  });

   service.publish('patched', (conversation, context) => {
    console.log('[Conversation patched] Publishing to conversation channel:', conversation.id);
    return app.channel(`authenticated`);
  });


  // service.publish((conversation, context) =>
  //   app
  //     .channel(`conversation-${conversation.id}`)
  //     .filter((connection) => connection.User.id !== context.params.User.id)
  // );
  service.hooks(hooks);

  const messageOptions = {
    Model: MessageModel,
    paginate: app.get('paginate'),
  };

  const middleware = (req, res, next) => {
    console.log('Middleware for messages');
    next();
  }
  app.use('/conversation/:conversationId/messages',middleware, new Message(messageOptions, app));
  const messageService = app.service('conversation/:conversationId/messages');
  messageService.hooks(MessageHook);
  messageService.publish('created', (message, context) => {
    console.log('🫀[Message Created>>>] Publishing to conversation channel:', message.conversationId);
    return app.channel(`authenticated`);
  });

  messageService.publish('patched', (message, context) => {
    console.log('🫀[Message Patched>>>] Publishing to conversation channel:', message.conversationId);
    return app.channel(`authenticated`);
  });
}
