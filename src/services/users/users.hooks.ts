import commonHooks from 'feathers-hooks-common';
import * as local from '@feathersjs/authentication-local';
import { HookContext } from '@feathersjs/feathers';

import isSelf from '../../Hooks/isSelf.hook';
import updateTsVector from './hook/updateTsVector';
import applyProfileMediaKeys from '../../Hooks/ApplyProfileMediaKeys.hooks';
import includeFriendshipStatus from './hook/includeFriendshipStatus';

const { protect } = local.hooks;
const protectKeys = protect(...['search_vector']);

const Addvisitor= async (context: HookContext): Promise<HookContext> => {
  if (!context?.result ) return context;
    await context.app.service('notifications').create({
      fromUserId: context.params.User.id,
      userId: context.result.id,
      message: 'Visited your profile',
      type: 'direct',
      entityName: 'User',
      entityId: context.params.User.id,
      notificationType: 'visit',
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
    create: [protectKeys, updateTsVector],
    patch: [protectKeys, updateTsVector],
    update: [protectKeys, updateTsVector],
    remove: [protectKeys],
  },
  error: {
  },
}

export default hooks;
