import { HookContext } from '@feathersjs/feathers';

export default async (context: HookContext) => {
  const { data } = context;
  if (data?.type !== 'direct') return context;
  const { userId } = data;
  const Sequelize = context.app.get('sequelizeClient');

  const {
    params: { User },
  } = context;

  try {
    const existingConversations = await Sequelize.query(
      `SELECT "conversation_id"
      FROM "conversation_users"
      WHERE "user_id" IN ('${userId}','${User.id}')
      GROUP BY "conversation_id"
      HAVING COUNT("conversation_id") > 1`,
      { type: 'SELECT' }
    );

    console.log('Existing Conversation:', existingConversations);

    if (existingConversations.length > 0) {
      const existingConversation = existingConversations[0];
      // Fetch the full conversation object to return
      const fullConversation = await context.app.service('conversation').get(existingConversation.conversation_id, context.params);
      context.result = fullConversation;
    }
  } catch (err) {
    console.log('Here is where the error occured');
    // @ts-ignore
    console.log(err.message);
   throw err;
  }
  console.log('Context Result after checking existing conversation: >>>>', context.result);
  return context;
};
