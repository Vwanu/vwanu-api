// // import {Call} from './call';
import {Post} from './post';
import {User} from './user';

import {Blog} from './blog';
// import {Album} from './album';
import {Media} from './media';
import {PostMedia} from './post-media';
import {BlogMedia} from './blog-media';
import {Korem} from './korem';
// import {Friend} from './Friends';
import {Message} from './message';
import {Interest} from './interest';
// import {Template} from './template';
import {Community} from './communities';
import { CommunityBan } from './community-bans';
// import {Discussion} from './discussion';

import {Conversation} from './conversation';
import {ConversationUser} from './conversation-user';
import {Notification} from './notification';
import {Friendship} from './friendship';
// import {BlogResponse} from './blog-response';
import {CommunityUser} from './community-users';
import {CommunityInvitationRequest} from './communityInvitationRequest';
import {CommunityJoinRequest} from './communityJoinRequest';
// import {Forum} from './forums';
// import {Place} from './places';
// import {UserWorkPlace} from './userWorkplace';
// import {CommunityBan} from './community-bans';
// import {CommunityHistory} from './community-history';
// import {NotificationType} from './notifications_types';
// import {UserNotificationSettings} from './user_notifications_settings';
// import {ErrorCode} from './errorCodes.db';
// import {ExpiryTime} from './expiryTime';
// import {UserNotificationTypes} from './user_notification_types';
import { CommunityRole } from './communityRole.model';
import {CommunityInterest, BlogInterest} from './junction-tables';
import {ForumDiscussion} from './forumDiscussion';
import {UserFollower} from './user-follower';

export default [
//   // Call,
  User,
  Post,
  Blog,
  // Album,
  Media,
  PostMedia,
  BlogMedia,
  Korem,
//   Friend,

  Message,
  Interest,
//   Template,
  Community,
//   Discussion,
  Conversation,
  ConversationUser,
  Notification,
  Friendship,
//   BlogResponse,
  CommunityUser,
  CommunityBan,
//   CommunityHistory,
  CommunityInvitationRequest,
  CommunityJoinRequest,
  CommunityRole,
  CommunityInterest,
  BlogInterest,
  ForumDiscussion,
  UserFollower,
//   Forum,
//   Place,
//   NotificationType,
//   UserNotificationSettings,
//   ErrorCode,
//   ExpiryTime,
//   UserNotificationTypes,
];

// export default [];
