import { disallow } from 'feathers-hooks-common';
import AgeAllow from '../../Hooks/AgeAllow';
import { requireAuth } from '../../Hooks/requireAuth';


export default {
  before: {
    all: [requireAuth, AgeAllow],
    find: [],
    get: [],
    create: disallow(),
    update: disallow(),
    patch: disallow(),
    remove: disallow(),
  },

  after: {
    all: [],
    find: [],
    get: [],
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
