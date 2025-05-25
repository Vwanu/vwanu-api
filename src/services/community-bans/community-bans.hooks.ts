
import * as schema from '../../schema/bans';
import validateResource from '../../middleware/validateResource';





export default {
  before: {
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
