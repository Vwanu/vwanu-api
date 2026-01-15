// import { AdjustCount } from '../../../Hooks';

// const AdjustCountOptions = {
//   model: 'Conversation',
//   field: 'amountOfMessages',
//   key: 'ConversationId',
// };

// const AdjustAmountMessagesInConversation = AdjustCount(AdjustCountOptions);

// export default AdjustAmountMessagesInConversation;

import  {HookContext} from '@feathersjs/feathers';


export default async (context: HookContext) => {
    const { method, result, app } = context;
    const conversationId = result?.conversationId

    console.log('IncrementDecrementMessageInConversation Hook triggered for conversationId:', conversationId, 'with method:', method);

    if (!conversationId) return context;
    try {


    const conversation = await app.get('sequelizeClient').models.Conversation.findByPk(conversationId);

    // app.service('conversation').patch(conversationId, {
    //     $increment: {
    //         amountOfMessages: method === 'create' ? 1 : method === 'remove' ? -1 : 0
    //     }
    // }, context.params);
   await app.service('conversation').patch(conversationId, {
        amountOfMessages: method === 'create' ? (conversation.amountOfUnreadMessages || 0) + 1 : method === 'remove' ? Math.max((conversation.amountOfUnreadMessages || 1) - 1, 0) : conversation.amountOfUnreadMessages
    }, {
        // Pass only necessary params, not the full context.params from message service
        User: context.params.User,
        provider: undefined // Make it an internal call to bypass external-only hooks
    });

      } catch (error) {
        console.error('Error updating amountOfMessages in conversation:');
        // @ts-ignore
        console.error(error.message);
    }
    return context;

}
