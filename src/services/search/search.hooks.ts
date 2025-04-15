import * as local from '@feathersjs/authentication-local';
import { disallow } from 'feathers-hooks-common';
import MediaStringToMediaObject from '../../Hooks/ProfileCoverToObject';
import modifyQueryForSearch from './modifyQueryForSearch';
import { requireAuth } from '../../Hooks/requireAuth';

const { protect } = local.hooks;
export default {
  before: {
    all: [requireAuth],
    find: [modifyQueryForSearch({ searchColumn: 'search_vector' })],
    get: [disallow()],
    create: [disallow()],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow()],
  },

  after: {
    all: [
      protect(
        ...[
          'password',
          'verifyToken',
          'resetToken',
          'resetShortToken',
          'resetExpires',
          'verifyShortToken',
          'activationKey',
          'resetPasswordKey',
          'verifyExpires',
          'search_vector',
        ]
      ),
    ],
    find: [],
    get: [MediaStringToMediaObject(['profilePicture'])],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
