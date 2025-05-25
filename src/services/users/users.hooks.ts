import commonHooks from 'feathers-hooks-common';
import { HooksObject, HookContext, Service } from '@feathersjs/feathers';
import * as local from '@feathersjs/authentication-local';

import isSelf from '../../Hooks/isSelf.hook';
import saveProfilePicture from '../../Hooks/SaveProfilePictures.hooks';
import MediaStringToMediaObject from '../../Hooks/ProfileCoverToObject';

import { AddVisitor } from './hook';
import updateTsVector from './hook/updateTsVector';

const { protect } = local.hooks;
const protectKeys = protect(...['search_vector']);

const hooks = {
  before: {
    create: commonHooks.disallow(),
    update: commonHooks.disallow(),
    patch: [
      isSelf,
      commonHooks.iff(
        commonHooks.isProvider('external'),
        commonHooks.preventChanges(true, ...['email'])
      ),
      saveProfilePicture(['profilePicture', 'coverPicture']),
    ],
    remove: [isSelf],
  },

  after: {
  all: [MediaStringToMediaObject(['profilePicture', 'coverPicture'])],

  find: [protectKeys],
  get: [AddVisitor, protectKeys],
    patch: [protectKeys, updateTsVector],
    remove: [protectKeys],
  },
  error: {
    all: [
      (context: HookContext<Service<any>>) => {
        if (context.error) {
          console.log('Error in users.hooks.ts');
          console.log(context.error);
        }
      },
    ],
  },
} as HooksObject<any>;

export default hooks;
