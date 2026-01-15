import commonHooks from 'feathers-hooks-common';
import { HookContext } from '@feathersjs/feathers';

/** Local dependencies */
import { AddTalker } from '../../Hooks';

import {
//   NotifyUsers,
  LimitToTalkersOnly,
  FilterConversations,
  LimitDirectConversations,
} from './hook';


const refetch = async (context : HookContext) : Promise<HookContext> => {
  const conversation = await context.app.service('conversation').get(context.result.id, context.params);
    context.result = conversation;
 return context;
};

export default {
  before: {
    find: [FilterConversations],
    get: [FilterConversations],
    create: [LimitDirectConversations],
    update: [commonHooks.disallow('external')],
    remove: [LimitToTalkersOnly],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [AddTalker, refetch],// notifiy users added to conversation
    patch: [refetch],
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
