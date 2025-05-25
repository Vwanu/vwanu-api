import { disallow } from 'feathers-hooks-common';




export default {
  before: {
 
    find: disallow(),
    get: disallow(),
    create: [],
    update: disallow(),
    patch: disallow(),
    remove: disallow(),
  },

};
