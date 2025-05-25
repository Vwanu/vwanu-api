import { disallow } from 'feathers-hooks-common';
/** Local dependencies */
import GetTimeline from './hooks/getTimeline';


export default {
  before: {
 all:[],
    find: [GetTimeline],
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
