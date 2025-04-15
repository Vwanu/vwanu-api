import AutoOwn from '../../Hooks/AutoOwn';
import AgeAllow from '../../Hooks/AgeAllow';
import LimitToOwner from '../../Hooks/LimitToOwner';
import NoCommentOnLockParents from '../../Hooks/NoCommentOnLockParents';
import CanDiscussInCommunity from '../../Hooks/CanDoInCommunity.hook';
import { requireAuth } from '../../Hooks/requireAuth';

import { includeUserAndLastComment, AssociateWithForumInterest } from './hooks';



export default {
  before: {
    all: [requireAuth, AgeAllow],
    find: [includeUserAndLastComment(false)],
    get: [includeUserAndLastComment(true)],
    create: [AutoOwn, CanDiscussInCommunity, NoCommentOnLockParents],
    update: [LimitToOwner],
    patch: [LimitToOwner],
    remove: [LimitToOwner],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [AssociateWithForumInterest],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [
      (ctx) => {
        console.log('Error in discussion create hook');
        console.log(ctx.error);
        return ctx;
      },
    ],
    update: [],
    patch: [],
    remove: [],
  },
};
