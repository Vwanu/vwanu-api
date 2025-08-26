import commonHooks from 'feathers-hooks-common';
import { HooksObject } from '@feathersjs/feathers';
import * as local from '@feathersjs/authentication-local';

import isSelf from '../../Hooks/isSelf.hook';
import saveProfilePicture from '../../Hooks/SaveProfilePictures.hooks';
import MediaStringToMediaObject from '../../Hooks/ProfileCoverToObject';

// import { AddVisitor } from './hook';
import updateTsVector from './hook/updateTsVector';

const { protect } = local.hooks;
const protectKeys = protect(...['search_vector']);

const hooks = {
  before: {
    create: [],
    update: commonHooks.disallow(),
    patch: [
      (context) => {
        console.log('patch1');
        return context;
      },
      isSelf,
      (context) => {
        console.log('patch2');
        return context;
      },
      commonHooks.iff(
        commonHooks.isProvider('external'),
        commonHooks.preventChanges(true, ...['email']),
      ),
      (context) => {
        console.log('patch3');
        return context;
      },
      saveProfilePicture(['profilePicture', 'coverPicture']),
      async (context) => {
        console.log('patch4');
        // const app = context.app;
        // const { data } = context;
        // const { id } = data;
        // const user = await app.service('users').get(id);
        // console.log(user);
        // console.log('updated user');
        return context;
      },
    ],
    remove: [isSelf],
  },

  after: {
    all: [MediaStringToMediaObject(['profilePicture', 'coverPicture'])],

    find: [protectKeys],
    // get: [AddVisitor, protectKeys],
    patch: [protectKeys, updateTsVector],
    remove: [protectKeys],
  },
  error: {
    all: [
      // (context: HookContext<Service<any>>) => {
      //   if (context.error) {
      //     console.log('Error in users.hooks.ts');
      //     console.log(context.error);
      //   }
      // },
    ],
  },
} as HooksObject<any>;

export default hooks;
