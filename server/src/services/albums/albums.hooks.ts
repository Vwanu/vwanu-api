import * as authentication from '@feathersjs/authentication';

import AutoOwn from '../../Hooks/AutoOwn.hook';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [
      (context) => {
        console.log('in a pre-hook');
        console.log(Object.keys(context.data));

        return context;
      },
      AutoOwn,
    ],
    update: [AutoOwn],
    patch: [AutoOwn],
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
