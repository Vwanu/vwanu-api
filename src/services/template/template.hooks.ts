import { disallow } from 'feathers-hooks-common';
import { requireAuth } from '../../Hooks/requireAuth';

const notAllow = disallow('external');

export default {
  before: {
    create: notAllow,
    update: notAllow,
    patch: requireAuth,
    remove: notAllow,
  },
};
