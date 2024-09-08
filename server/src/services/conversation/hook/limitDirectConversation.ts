import { QueryTypes } from '@sequelize/core';
import { HookContext } from '@feathersjs/feathers';

export default async (context: HookContext) => {
  const { data } = context;
  if (data?.type !== 'direct') return context;
  const { userIds } = data;
  const Sequelize = context.app.get('sequelizeClient');

  const {
    params: { User },
  } = context;

  try {
    const existingConversation = await Sequelize.query(
      `SELECT conversation_id as id FROM conversation_users WHERE user_id IN (${[
        ...userIds,
        User.id,
      ].map((id) => `'${id}'`)}) 
      GROUP BY conversation_id
      HAVING COUNT(conversation_id) > 1`,
      { type: QueryTypes.SELECT }
    );

    if (existingConversation.length > 0) {
      // eslint-disable-next-line prefer-destructuring
      context.result = existingConversation[0];
      context.data.userIds = null;
    }
  } catch (err) {
    console.log('Here is where the error occured');
    throw new Error(err.message);
  }
  return context;
};
