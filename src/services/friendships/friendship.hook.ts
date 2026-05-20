
import { AddAssociations } from '../../Hooks';
import { User } from '../../database/user';
import AutoAssignHook from '../../Hooks/AutoAssign.hook';
import { disallow } from 'feathers-hooks-common';
import { HookContext } from '@feathersjs/feathers';
import { FriendshipStatus } from '../../types/enums';
import { NotificationSlug } from '../../types/notifications';
import { notificationTypeIdFor } from '../notification/notificationTypeCache';

const AddTargetUser = AddAssociations({
  models: [
    {
      model: User,
      as: 'target',
      attributes: ['id', 'firstName', 'lastName', 'profilePicture'],
    },
    {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'profilePicture'],
    }
  ],
});

// Notify target user when a friend request is sent
const notifyFriendRequest = async (context: HookContext): Promise<HookContext> => {
  if (!context.result || !context.params.User?.id) return context;

  try {
    await context.app.service('notifications').create({
      fromUserId: context.params.User.id,
      userId: context.result.targetId, // notification goes to the target user
      message: 'Sent you a friend request',
      type: 'direct',
      entityName: 'Friendship',
      entityId: context.result.id,
      notificationTypeId: await notificationTypeIdFor(NotificationSlug.NEW_FRIEND_REQUEST),
    });
  } catch (error) {
    console.error('Error creating friend request notification:', error);
  }

  return context;
};

// Notify requester when their friend request is accepted
const notifyFriendAccept = async (context: HookContext): Promise<HookContext> => {
  if (!context.result || context.result.status !== FriendshipStatus.ACCEPTED) return context;
  if (!context.params.User?.id) return context;

  // Determine who to notify: if the current user is the target, notify the requester
  const notifyUserId = context.result.userId === context.params.User.id
    ? context.result.targetId
    : context.result.userId;

  try {
    await context.app.service('notifications').create({
      fromUserId: context.params.User.id,
      userId: notifyUserId,
      message: 'Accepted your friend request',
      type: 'direct',
      entityName: 'Friendship',
      entityId: context.result.id,
      notificationTypeId: await notificationTypeIdFor(NotificationSlug.NEW_FRIEND_ACCEPT),
    });
  } catch (error) {
    console.error('Error creating friend accept notification:', error);
  }

  return context;
};

export default {
  before: {
    find: AddTargetUser,
    update: disallow(),
    patch: AddTargetUser,
    create:[AddTargetUser, AutoAssignHook({userId:null})],
  },
  after: {
    create: notifyFriendRequest,
    patch: notifyFriendAccept,
  },
};
