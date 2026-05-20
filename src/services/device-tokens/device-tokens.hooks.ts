import { disallow } from 'feathers-hooks-common';

/**
 * Lock down all CRUD methods except `create` and `remove`. The mobile app
 * registers tokens via POST and revokes via DELETE; nothing else should
 * be reachable externally.
 */
export default {
  before: {
    find: [disallow('external')],
    get: [disallow('external')],
    update: [disallow('external')],
    patch: [disallow('external')],
    // create + remove have their own auth + ownership checks inside the class.
  },
};
