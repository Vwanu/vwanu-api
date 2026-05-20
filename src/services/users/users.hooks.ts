import commonHooks from 'feathers-hooks-common';
import * as local from '@feathersjs/authentication-local';
import { HookContext } from '@feathersjs/feathers';

import isSelf from '../../Hooks/isSelf.hook';
import updateTsVector from './hook/updateTsVector';
import applyProfileMediaKeys from '../../Hooks/ApplyProfileMediaKeys.hooks';
import includeFriendshipStatus from './hook/includeFriendshipStatus';
import seedNotificationPreferences from './hook/seedNotificationPreferences';
import { NotificationSlug } from '../../types/notifications';
import { notificationTypeIdFor } from '../notification/notificationTypeCache';

const { protect } = local.hooks;
const protectKeys = protect(...['search_vector']);

const Addvisitor= async (context: HookContext): Promise<HookContext> => {
  if (!context?.result ) return context;
  // Self-visit shouldn't generate a notification. VWA-141's funnel will
  // enforce this centrally; for now we guard at the callsite.
  if (context.params?.User?.id === context.result.id) return context;
    await context.app.service('notifications').create({
      fromUserId: context.params.User.id,
      userId: context.result.id,
      message: 'Visited your profile',
      type: 'direct',
      entityName: 'User',
      entityId: context.params.User.id,
      notificationTypeId: await notificationTypeIdFor(NotificationSlug.NEW_VISIT),
    });
  return context;
};


const hooks = {
  before: {
    create: [],
    get: [includeFriendshipStatus],
    update: commonHooks.disallow(),
    patch: [
      isSelf,
      commonHooks.iff(
      commonHooks.isProvider('external'),
      commonHooks.preventChanges(true, ...['email']),
      ),
      applyProfileMediaKeys,
    ],
    remove: [isSelf],
  },

  after: {
    find: [protectKeys],
    get: [Addvisitor, protectKeys],
    // VWA-140: seed notification preferences for the new user (replaces the
    // never-actually-installed fn_add_user_notification trigger).
    create: [protectKeys, updateTsVector, seedNotificationPreferences],
    patch: [protectKeys, updateTsVector],
    update: [protectKeys, updateTsVector],
    remove: [protectKeys],
  },
  error: {
  },
}

export default hooks;
