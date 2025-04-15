import { requireAuth } from '../../Hooks/requireAuth';
import { disallow } from 'feathers-hooks-common';
// import { BadRequest } from '@feathersjs/errors';
import notify from './hooks/notify';
import Query from './hooks/querryFriendRequest';

import AgeAllow from '../../Hooks/AgeAllow';



export default {
  before: {
    all: [requireAuth, AgeAllow],
    find: Query,
    get: disallow(),
    update: disallow(),
  },
  after: {
    create: notify,
  },
};
