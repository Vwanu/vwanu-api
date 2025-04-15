
import * as schema from '../../schema/bans';
import validateResource from '../../middleware/validateResource';
import AgeAllow from '../../Hooks/AgeAllow';
import { requireAuth } from '../../Hooks/requireAuth';



export default {
  before: {
    all: [requireAuth, AgeAllow],
    create: validateResource(schema.createBanSchema),
    find: [],
    get: [],
    update: [],
    patch: [],
    remove: [],
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
