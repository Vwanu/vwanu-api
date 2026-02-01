import commonHooks from 'feathers-hooks-common';
import { AddTalker, refetch } from '../../Hooks';

import {
  LimitToTalkersOnly,
  FilterConversations,
  LimitDirectConversations,
} from './hook';

export default {
  before: {
    find: [FilterConversations],
    get: [FilterConversations],
    create: [LimitDirectConversations],
    update: [commonHooks.disallow('external')],
    remove: [LimitToTalkersOnly],
  },

  after: {
    patch: [refetch('conversation')],
    create: [AddTalker, refetch('conversation')],
  },
};
