import { disablePagination, disallow } from 'feathers-hooks-common';

import OrderBy from '../../Hooks/OrderBy.hooks';


const notAllow = disallow('external');
export default {
  before: {
 all:[],
    find: [disablePagination(), OrderBy({ name: 1 })],
    get: notAllow,
    create: notAllow,
    update: notAllow,
    patch: notAllow,
    remove: notAllow,
  },
};
