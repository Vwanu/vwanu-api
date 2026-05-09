/* eslint-disable no-underscore-dangle */

// Don't remove this comment. It's needed to format import lines nicely.
import { disallow } from 'feathers-hooks-common';
import LimitToOwner from '../../Hooks/LimitToOwner';
import { AutoOwn } from '../../Hooks';


import applyProfileMediaKeys from '../../Hooks/ApplyProfileMediaKeys.hooks';

// import SaveAndAttachInterests from '../../Hooks/SaveAndAttachInterest';

import { FindCommunities } from './hooks';


export default {
  before: {
    find: [FindCommunities],
    create: [
      AutoOwn,
      applyProfileMediaKeys,
    ],
    update: disallow(),
    patch: [
      LimitToOwner,
      applyProfileMediaKeys,
    ],
    remove: [LimitToOwner],
  },

  after: {
    create: [
      // AutoJoin,
      // SaveAndAttachInterests({
      //   entityName: 'Community',
      //   relationTableName: 'Community_Interest',
      //   foreignKey: 'CommunityId',
      // }),
      // refetch,
    ],
  },
};
