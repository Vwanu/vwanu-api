

/** Local dependencies */
import AutoOwn from '../../Hooks/AutoOwn';

import { LimitToOwner } from '../../Hooks';
import DeletePost from './hooks/deletePost';
import * as schema from '../../schema/post';
import GetTimeline from '../timeline/hooks/getTimeline';
import validateResource from '../../middleware/validateResource';
import CanPostInCommunity from '../../Hooks/CanDoInCommunity.hook';
import CanComment from '../../Hooks/NoCommentOnLockParents';

export default {
  before: {
 
    find: [GetTimeline],
    get: [GetTimeline],
    create: [
      (context) => {
        console.log(`\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>`);
        console.log('context in create', context.data);
        console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n\n`);
        return context;
      },
      AutoOwn,
      validateResource(schema.createPostSchema),
      CanPostInCommunity,
      CanComment,
    ],
    update: [CanPostInCommunity],
    patch: [(context) => {
      console.log(`\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>`);
      console.log('b4 context in create', context.data);
      console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n\n`);
      return context;
    },LimitToOwner,(context) => {
      console.log(`\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>`);
      console.log('af context in create', context.data);
      console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n\n`);
      return context;
    },],
    remove: [DeletePost],
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
    patch: [(context) => {
      console.log(`\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>`);
      console.log('context in patch', context.error);
      console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n\n`);
      return context;
    },],
    remove: [],
  },
};
