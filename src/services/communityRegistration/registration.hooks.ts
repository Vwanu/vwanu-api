import { disallow } from 'feathers-hooks-common';

import AgeAllow from '../../Hooks/AgeAllow';
import { requireAuth } from '../../Hooks/requireAuth';

export default {
  before: {
    all: [requireAuth, AgeAllow],
    find: disallow(),
    get: disallow(),
    create: [],
    update: disallow(),
    patch: disallow(),
    remove: disallow(),
  },

};
