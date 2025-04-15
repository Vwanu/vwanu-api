import { disablePagination, disallow } from 'feathers-hooks-common';

import OrderBy from '../../Hooks/OrderBy.hooks';
import { requireAuth } from '../../Hooks/requireAuth';

const notAllow = disallow('external');
export default {
  before: {
    all: [requireAuth],
    find: [disablePagination(), OrderBy({ name: 1 })],
    get: notAllow,
    create: notAllow,
    update: notAllow,
    patch: notAllow,
    remove: notAllow,
  },
};
