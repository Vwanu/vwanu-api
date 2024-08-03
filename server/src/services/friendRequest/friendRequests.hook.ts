import * as feathersAuthentication from '@feathersjs/authentication';
import { disallow } from 'feathers-hooks-common';
// import { BadRequest } from '@feathersjs/errors';
import notify from './hooks/notify';
import Query from './hooks/querryFriendRequest';

import AgeAllow from '../../Hooks/AgeAllow';
import AddAssociations from '../../Hooks/AddAssociations';
import sanitize from './hooks/beforeCreate'

const { authenticate } = feathersAuthentication.hooks;

export default {
  before: {
    all: [authenticate('jwt'), AgeAllow],
    create: sanitize,
    find: [Query,
      AddAssociations({
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
      })
    ],
    get: disallow(),
    update: disallow(),
  },
  after: {
    create: notify,
  },
};
