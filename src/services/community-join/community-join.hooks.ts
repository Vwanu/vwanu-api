import { disallow } from 'feathers-hooks-common';

import validateResource from '../../middleware/validateResource';
import createCommunityJoinSchema from '../../schema/community-join';
import AgeAllow from '../../Hooks/AgeAllow';
import { requireAuth } from '../../Hooks/requireAuth';

export default {
  before: {
    all: [requireAuth, AgeAllow],
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
