import { ServiceAddons } from '@feathersjs/feathers';

import hooks from './conversation.hooks';
import {Message} from '../message/message.class'
import { Application } from '../../declarations';
import MessageHook from '../message/message.hooks'
import { Conversation } from './conversation.class';
import { Message as MessageModel } from '../../database/message';
import { Conversation as ConversationType } from '../../database/conversation';

declare module '../../declarations' {
  interface ServiceTypes {
    conversation: Conversation & ServiceAddons<ConversationType>;
    ['conversation/:conversationId/messages']: MessageModel & ServiceAddons<MessageModel>;
  }
}

export default function (app: Application): void {
  const conversationServiceOptions = {
    Model: ConversationType,
    paginate: app.get('paginate'),
  };

  app.use('/conversation', new Conversation(conversationServiceOptions, app));
  const conversationService = app.service('conversation');
  conversationService.hooks(hooks);

  conversationService.publish('created', async (_, context) => {
    // @ts-ignore
    const userIds = [context.params.User.id, context.data?.userId];
    return app.channel(`authenticated`).filter((connection) => {
        console.log('Connection User ID:', connection.user.id);
      return connection && userIds.includes(connection.user.id);
    });
  });
   conversationService.publish('patched', async (conversation, context) => {
    const converationUserIds = await context
    .app.get('sequelizeClient').models.ConversationUser.findAll({
        where: { conversationId: conversation.id },
        attributes: ['userId'],
    }).then((records) => records.map((record) => record.userId));
       return app.channel(`authenticated`).filter((connection) => {
      return connection && converationUserIds.includes(connection.user.id);
    });
  });

  const messageServiceOptions = {
    Model: MessageModel,
    paginate: app.get('paginate'),
  };

  app.use('/conversation/:conversationId/messages', new Message(messageServiceOptions, app));

  const messageService = app.service('conversation/:conversationId/messages');
  messageService.hooks(MessageHook);

  messageService.publish(async (message, context) => {
    const conversationId = message.conversationId;
    const conversationUserModel = context.app.get('sequelizeClient').models.ConversationUser;
    try {
        const conversationParticipantIds = await conversationUserModel.findAll({
            where: { conversationId },
            attributes: ['userId'],
    }).then(records => records.map(record => record.userId));

   return app.channel(`authenticated`).filter((connection) => {
      return connection && conversationParticipantIds.includes(connection.user.id);
    });
    }catch(e){
        console.error('Error fetching conversation participants:', e);
    }
  });

}
