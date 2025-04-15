import commonHooks from 'feathers-hooks-common';
import { HooksObject, HookContext, Service } from '@feathersjs/feathers';

import isSelf from '../../Hooks/isSelf.hook';
// import saveProfilePicture from '../../Hooks/SaveProfilePictures.hooks';
// import MediaStringToMediaObject from '../../Hooks/ProfileCoverToObject';

// import newPerson from './hook/newPerson';
import { requireAuth } from '../../Hooks/requireAuth';
// import { AddVisitor, GetUser, NewPerson } from './hook';
// import SaveAndAttachInterests from '../../Hooks/SaveAndAttachInterest';
// import updateTsVector from './hook/updateTsVector';

// const { protect } = local.hooks;
// const protectKeys = protect(...['search_vector']);

const hooks = {
  before: {
    all: [requireAuth],
    create: commonHooks.disallow(),
    update: commonHooks.disallow(),
    patch: [
      // commonHooks.iff(
      //   commonHooks.isProvider('external'),
      //   commonHooks.preventChanges(true, ...['email'])
      //   //   isSelf
      // ),
      // saveProfilePicture(['profilePicture', 'coverPicture']),
    ],
    remove: [isSelf],
  },

  // after: {
  // all: [MediaStringToMediaObject(['profilePicture', 'coverPicture'])],

  // create: NewPerson,
  // find: [protectKeys],
  // get: [AddVisitor, protectkeys],
  //   patch: [protectKeys, updateTsVector],
  //   remove: [protectKeys],
  // },
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
