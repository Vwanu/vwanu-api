
import { createCallSchema } from '../../schema/call';
import validateResource from '../../middleware/validateResource';
import {
  AssignCaller,
  ReturnCallDetails,
  RegisterCallErrors,
} from './hooks';



export default {
  before: {
 all:[],
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
