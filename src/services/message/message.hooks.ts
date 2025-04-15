// import { HooksObject } from '@feathersjs/feathers';
import * as authentication from '@feathersjs/authentication';
import { requireAuth } from '../../Hooks/requireAuth';
// Don't remove this comment. It's needed to format import lines nicely.

import AgeAllow from '../../Hooks/AgeAllow';

import {
  AddSender,
  NewestFirst,
  PublishMessage,
  AdjustReadAndReceivedDate,
  IncludeSenderAndConversation,
  AdjustAmountMessagesInConversation,
  AdjustUnreadMessageInConversation,
} from './hooks';

const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [requireAuth, AgeAllow, IncludeSenderAndConversation],
    find: [NewestFirst],
    get: [],
    create: [AddSender],
    update: [],
    patch: [AdjustReadAndReceivedDate],
    remove: [],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      AdjustAmountMessagesInConversation,
      AdjustUnreadMessageInConversation,
      PublishMessage,
    ],
    update: [],
    patch: [AdjustUnreadMessageInConversation, PublishMessage],
    remove: [AdjustAmountMessagesInConversation],
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
