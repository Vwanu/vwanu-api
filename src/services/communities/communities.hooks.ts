/* eslint-disable no-underscore-dangle */

// Don't remove this comment. It's needed to format import lines nicely.
import { disallow } from 'feathers-hooks-common';
import LimitToOwner from '../../Hooks/LimitToOwner';
import { AutoOwn } from '../../Hooks';


import saveProfilePicture from '../../Hooks/SaveProfilePictures.hooks';

// import filesToBody from '../../middleware/PassFilesToFeathers/feathers-to-data.middleware';

// import SaveAndAttachInterests from '../../Hooks/SaveAndAttachInterest';

import { FindCommunities } from './hooks';


export default {
  before: {
    find: [FindCommunities],
    create: [
      AutoOwn,
      saveProfilePicture(['profilePicture', 'coverPicture']),
      // filesToBody,
    ],
    update: disallow(),
    patch: [
      LimitToOwner,
      saveProfilePicture(['profilePicture', 'coverPicture']),
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
