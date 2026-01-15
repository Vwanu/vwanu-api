import { HookContext } from '@feathersjs/feathers';
import {
  AddSender,
  NewestFirst,
  PublishMessage,
  AdjustReadAndReceivedDate,
  IncludeSenderAndConversation,
  AdjustAmountMessagesInConversation,
//   AdjustUnreadMessageInConversation,
} from './hooks';

import NestedPath from '../../Hooks/NestedPath';

const refetch = async (context : HookContext) : Promise<HookContext> => {
  const message = await context.app.service('conversation/:conversationId/messages').get(context.result.id, context.params);
    context.result = message;
 return context;
};
export default {
  before: {
   all:[IncludeSenderAndConversation],
    find: NewestFirst,
    create: [NestedPath,AddSender],
    patch: [(c)=>{
        console.log('HOOK PATCH MESSAGE',c.data);
        if(c.data.isRead){
            c.data.readDate=new Date();
            delete c.data.isRead;
        }else if(c.data.isDelivered){
            c.data.receivedDate=new Date();
            delete c.data.isDelivered;
        }

        return c
    },AdjustReadAndReceivedDate]
  },

  after: {
    create: [
      AdjustAmountMessagesInConversation,
      refetch,
    //   AdjustUnreadMessageInConversation,
    //   PublishMessage,
    ],
    update: [],
    patch: [PublishMessage, AdjustAmountMessagesInConversation],
    remove: [AdjustAmountMessagesInConversation],
  },
};
