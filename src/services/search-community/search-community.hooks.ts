import { requireAuth } from '../../Hooks/requireAuth';
import modifyQueryForSearch from '../search/modifyQueryForSearch';


export default {
  before: {
    all: [requireAuth],
    find: [modifyQueryForSearch({ searchColumn: 'search_vector' })],
    get: [],
    create: [],
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
