import { HookContext } from '@feathersjs/feathers';

export default async (context: HookContext) => {
    console.log('🫀PublishMessage Hook context:');
  const { result , app } = context;

  console.log('🫀PublishMessage Hook triggered for message: service', context.service);

  const { conversationId } = result;
  if (!conversationId) return context;
//   const conversationUsers = await
//   app
//     .get('sequelizeClient')
//     .models.ConversationUser
//     .find({
//       query: {
//         conversationId,
//         $limit: 1000,
//       },
//       paginate: false,
//     });
    // const userIds = conversationUsers
    // .map((cu) => cu.userId)
    // .filter((id) => id !== context.params.userId);

  // Notify all users in the conversation except the sender
  app.service('conversation/:conversationId/messages').publish('created', () => {
    return app.channel('authenticated')
    // .filter((connection) => {
    //   return userIds.includes(connection.User.id);
    // });
  });
  return context;
};
