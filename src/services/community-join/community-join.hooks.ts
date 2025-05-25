import { disallow } from 'feathers-hooks-common';

import validateResource from '../../middleware/validateResource';
import createCommunityJoinSchema from '../../schema/community-join';


export default {
  before: {
    find: disallow(),
    get: disallow(),
    create: validateResource(createCommunityJoinSchema),
    update: disallow(),
    patch: disallow(),
    remove: disallow(),
  },

  after: {
    create: [],
  },
};
