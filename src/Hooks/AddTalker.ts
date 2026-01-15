import { HookContext } from '@feathersjs/feathers';
import { GeneralError } from '@feathersjs/errors';
import isNill from 'lodash/isNil';
import AdjustCount from './AdjustCount';

export default async (context: HookContext) => {
  const { data } = context;
  if (isNill(data.userId)) return context;
  const {ConversationUser} = context.app.get('sequelizeClient').models;

  const addedUser = await Promise.all(
    [data.userId, context.params.User.id].map((userId) =>
      ConversationUser.findOrCreate({
          where: {
            userId: userId,
            conversationId: context.result.id,
          },
        })
    )
  );

  const updateUserCount = AdjustCount({
    model: 'Conversation',
    field: 'amountOfPeople',
    key: context.result.id,
    foreignId: context.result.id,
    incremental: addedUser.length,
  });

  try {
    await updateUserCount(context);
    context.result.amountOfPeople = addedUser.length;
  } catch (e: unknown | any) {
    throw new GeneralError(e);
  }

  return context;
};
