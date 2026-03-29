import { HooksObject } from '@feathersjs/feathers';
import AdjustAmountOfLikes from './hooks/adjustAmountOfLikes';

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [AdjustAmountOfLikes],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    patch: [],
    remove: [],
  },
} as HooksObject;
