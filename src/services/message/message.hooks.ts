import { refetch, NestedPath } from '../../Hooks';

import {
  AddSender,
  NewestFirst,
  AdjustReadAndReceivedDate,
  IncludeSenderAndConversation,
  AdjustAmountMessagesInConversation,
} from './hooks';

export default {
  before: {
   all:[IncludeSenderAndConversation],
    find: [NewestFirst, NestedPath],
    create: [NestedPath,AddSender],
    patch: AdjustReadAndReceivedDate
  },

  after: {
    create: [
      AdjustAmountMessagesInConversation,
      refetch('conversation/:conversationId/messages')
    ],
    patch: AdjustAmountMessagesInConversation,
    remove: AdjustAmountMessagesInConversation,
  },
};
