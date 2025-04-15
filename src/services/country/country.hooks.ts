import { disallow } from 'feathers-hooks-common';
import OrderBy from '../../Hooks/OrderBy.hooks';
// Don't remove this comment. It's needed to format import lines nicely.

import { requireAuth } from '../../Hooks/requireAuth';
// const { authenticate } = authentication.hooks;

const notAllow = disallow('external');
export default {
  before: {
    all: [requireAuth],
    find: [OrderBy({ name: 1 })],
    get: notAllow,
    create: notAllow,
    update: notAllow,
    patch: notAllow,
    remove: notAllow,
  },
};
