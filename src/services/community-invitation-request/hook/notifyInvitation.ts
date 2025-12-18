import { HookContext } from '@feathersjs/feathers';

const notifyInvitation = async (context: HookContext): Promise<HookContext> => {
  const {
    app,
    data,
    result,
    params,
  } = context;
  if (!result) return context;
  const { userIds, CommunityId } = data;
  const { User } = params;

  const guestIds = Array.isArray(userIds) ? userIds : [userIds];

  const notificationsToCreate = guestIds.map((guestId) => ({
    UserId: User.id,
    to: guestId,
    message: `Invited you to join a community`,
    type: 'direct',
    entityName: 'Community',
    entityId: CommunityId,
  }));

  await app.service('notification').create(notificationsToCreate, params);

  return context;
};

export default notifyInvitation;