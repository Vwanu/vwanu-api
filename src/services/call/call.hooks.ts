
import { createCallSchema } from '../../schema/call';
import validateResource from '../../middleware/validateResource';
import {
  AssignCaller,
  ReturnCallDetails,
  RegisterCallErrors,
} from './hooks';

import { requireAuth } from '../../Hooks/requireAuth';

export default {
  before: {
    all: [requireAuth],
    find: [],
    get: [],
    create: [
      validateResource(createCallSchema),
      AssignCaller,
    ],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [ReturnCallDetails],
    find: [],
    get: [],
    create: [
    ],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [RegisterCallErrors],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
