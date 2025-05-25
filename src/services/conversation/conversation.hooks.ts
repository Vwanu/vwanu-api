/* eslint-disable no-case-declarations */
import commonHooks from 'feathers-hooks-common';

/** Local dependencies */
import { AddTalker } from '../../Hooks';

import {
  SetType,
  NotifyUsers,
  LimitToTalkersOnly,
  FilterConversations,
  LimitDirectConversations,
} from './hook';



export default {
  before: {
 
    find: [FilterConversations],
    get: [FilterConversations],
    create: [SetType, LimitDirectConversations],
    update: [commonHooks.disallow('external')],
    patch: [LimitToTalkersOnly],
    remove: [LimitToTalkersOnly],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [AddTalker, NotifyUsers],
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
