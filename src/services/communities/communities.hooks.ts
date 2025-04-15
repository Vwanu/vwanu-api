/* eslint-disable no-underscore-dangle */
import * as authentication from '@feathersjs/authentication';
// Don't remove this comment. It's needed to format import lines nicely.
import { disallow } from 'feathers-hooks-common';
import LimitToOwner from '../../Hooks/LimitToOwner';
import { AutoOwn, AgeAllow } from '../../Hooks';
import { requireAuth } from '../../Hooks/requireAuth';

import saveProfilePicture from '../../Hooks/SaveProfilePictures.hooks';

import filesToBody from '../../middleware/PassFilesToFeathers/feathers-to-data.middleware';

import SaveAndAttachInterests from '../../Hooks/SaveAndAttachInterest';

import { FindCommunities } from './hooks';

const refetch = async (context) => {
  const { app, result } = context;
  const { id } = result;
  const community = await app.service('communities')._get(id);
  context.result = community;
  return context;
};

const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [requireAuth, AgeAllow],
    find: [FindCommunities],
    create: [
      AutoOwn,
      saveProfilePicture(['profilePicture', 'coverPicture']),
      filesToBody,
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
      SaveAndAttachInterests({
        entityName: 'Community',
        relationTableName: 'Community_Interest',
        foreignKey: 'CommunityId',
      }),
      refetch,
    ],
  },
};
