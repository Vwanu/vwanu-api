import commonHooks from 'feathers-hooks-common';
import { HooksObject } from '@feathersjs/feathers';
import * as local from '@feathersjs/authentication-local';

import isSelf from '../../Hooks/isSelf.hook';
import updateTsVector from './hook/updateTsVector';
import saveProfilePicture from '../../Hooks/SaveProfilePictures.hooks';

const { protect } = local.hooks;
const protectKeys = protect(...['search_vector']);

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
    get: [protectKeys],
    create: [protectKeys, updateTsVector],
    patch: [protectKeys, updateTsVector],
    update: [protectKeys, updateTsVector],
    remove: [protectKeys],
  },
  error: {
  },
} as HooksObject<any>;

export default hooks;
