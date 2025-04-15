import { requireAuth } from '../../Hooks/requireAuth';
import { disallow } from 'feathers-hooks-common';
// import { BadRequest } from '@feathersjs/errors';



export default {
  before: {
    all: [requireAuth],
    find: [],
    get: [],
    create: [

    ],
    update: [disallow()],
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
