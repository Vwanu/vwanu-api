
import { disallow } from 'feathers-hooks-common';
// import { BadRequest } from '@feathersjs/errors';
import notify from './hooks/notify';
import Query from './hooks/querryFriendRequest';





export default {
  before: {
 
    find: Query,
    get: disallow(),
    update: disallow(),
  },
  after: {
    create: notify,
  },
};
