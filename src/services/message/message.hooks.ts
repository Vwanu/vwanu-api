
import {
  AddSender,
  NewestFirst,
  PublishMessage,
  AdjustReadAndReceivedDate,
  IncludeSenderAndConversation,
  AdjustAmountMessagesInConversation,
  AdjustUnreadMessageInConversation,
} from './hooks';



export default {
  before: {
   all:[IncludeSenderAndConversation],
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
