import { disallow } from 'feathers-hooks-common';


// Don't remove this comment. It's needed to format import lines nicely.

import modifyQueryForSearch from '../search/modifyQueryForSearch';



export default {
  before: {
 all:[],
    find: [modifyQueryForSearch({ searchColumn: 'search_vector' })],
    get: [disallow()],
    create: [disallow()],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow()],
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
