import { disallow } from 'feathers-hooks-common';
import getFollower from './hooks/getFollower';

const notAllowed = disallow();
export default {
  before: {
    get: notAllowed,
    update: notAllowed,
    patch: notAllowed,
    find: [getFollower],
    create: [],
  },
  after: {
    create: [],
    remove: [],
  },
};
