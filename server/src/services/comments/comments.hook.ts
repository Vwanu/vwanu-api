import * as feathersAuthentication from '@feathersjs/authentication';

import addAssociation from '../../Hooks/AddAssociations';
import autoOwn from '../../Hooks/AutoOwn';
import LimitToOwner from '../../Hooks/LimitToOwner';
import AgeAllow from '../../Hooks/AgeAllow';
import validateResource from '../../middleware/validateResource';
import * as schema from '../../schema/comment.schema';
import CanComment from '../../Hooks/NoCommentOnLockParents';
import notifyPostOwner from './hooks/notifyPostOwner';


const { authenticate } = feathersAuthentication.hooks;

export default {
  before: {
    all: [authenticate('jwt'), AgeAllow,],
    find: [
      addAssociation({
        models: [
          {
            model: 'users',
            attributes: [
              'firstName',
              'lastName',
              'id',
              'profilePicture',
              'createdAt',
            ],
          },
        ],
      }),
    ],
    get: [
      authenticate('jwt'),
      addAssociation({
        models: [
          {
            model: 'users',
            attributes: [
              'firstName',
              'lastName',
              'id',
              'profilePicture',
              'createdAt',
            ],
          },
        ],
      }),
    ],
    create: [validateResource(schema.createCommentSchema), CanComment, autoOwn],
    update: [LimitToOwner],
    patch: [LimitToOwner],
    remove: [LimitToOwner],
  },

  after: {
    create: notifyPostOwner,
    patch: notifyPostOwner,
    remove: notifyPostOwner,
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
