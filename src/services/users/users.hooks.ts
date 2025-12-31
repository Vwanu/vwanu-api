import commonHooks from 'feathers-hooks-common';
import { HookContext } from '@feathersjs/feathers';
import * as local from '@feathersjs/authentication-local';

import isSelf from '../../Hooks/isSelf.hook';
import updateTsVector from './hook/updateTsVector';
import saveProfilePicture from '../../Hooks/SaveProfilePictures.hooks';

const { protect } = local.hooks;
const protectKeys = protect(...['search_vector']);

const AddVisitor = async (context: HookContext): Promise<HookContext> => {
  if (!context?.result)
    return context;
      await context.app.service('notifications').create({
          userId: context.result.id,
          fromUserId: context.params.User.id, //
          message: 'Visited your profile',
          type: 'direct',
          entityName: 'User',
          entityId: context.result.id,
          notificationType: 'visit',
        });
  return context;
};

const hooks = {
  before: {
    create: [],
    update: commonHooks.disallow(),
    patch: [
      isSelf,
      commonHooks.iff(
      commonHooks.isProvider('external'),
      commonHooks.preventChanges(true, ...['email']),
      ),
      saveProfilePicture(['profilePicture', 'coverPicture']),
    ],
    remove: [isSelf],
  },

  after: {
    find: [protectKeys],
    get: [AddVisitor, protectKeys],
    create: [protectKeys, updateTsVector],
    patch: [protectKeys, updateTsVector],
    update: [protectKeys, updateTsVector],
    remove: [protectKeys],
  },
  error: {
  },
}

export default hooks;
