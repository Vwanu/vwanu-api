import { Application } from '../declarations';
// /** Local dependencies */
import post from './posts/posts.service';
import users from './users/users.service';
// import search from './search/search.service';
import comments from './comments/comments.service';
import followers from './followers/followers.service';
import friendRequest from './friendships/friendship.service';
// import undesiredFriend from './undesiredFriends/undesiredFriends.service';
// import timeline from './timeline/timeline.service';
import blogs from './blogs/blogs.service';
// import albums from './albums/albums.service';
import notifications from './notification/notification.service';
import interests from './interests/interests.service';
// import medias from './medias/medias.service';
import communities from './communities/communities.service';
// import discussion from './discussion/discussion.service';
// import blogResponse from './blog-response/blog-response.service';
import korem from './korem/korem.service';
// import blogKorem from './blog-korem/blog-korem.service';
// import communityUsers from './community-users/community-users.service';
// import communityInvitationRequest from './community-invitation-request/community-invitation-request.service';
// import registration from './communityRegistration/communityRegistration.service';
// import communityJoin from './community-join/community-join.service';
import conversation from './conversation/conversation.service';
// import message from './message/message.service';
// import convesationUsers from './convesation-users/convesation-users.service';
import location from './location/location.service';
// import address from './address/address.service';
// import addressTypes from './address-types/address-types.service';
// import userAddress from './user-address/user-address.service';
// import searchBlog from './search-blog/search-blog.service';
// import searchCommunity from './search-community/search-community.service';
// import forumCategories from './forum-categories/forum-categories.service';
// import workplace from './workplace/workplace.service';
// import userWorkPlaces from './user-work-places/user-work-places.service';
// import communityBans from './community-bans/community-bans.service';
// import communityHistory from './community-history/community-history.service';
// import notificationTypes from './notification_types/notification_types.service';
// import userNotificationTypes from './user_notification_types/user_notification_types.service';
import  communityRole  from './community-role/community-role.service';

const services =[
//   search,
  post,
  users,
//   timeline,
  comments,
  followers,
  friendRequest,
//   undesiredFriend,
  blogs,
//   albums,
  notifications,
  interests,
//   medias,
  communities,
//   discussion,
//   blogResponse,
  korem,
//   blogKorem,
//   communityUsers,
  communityRole,
//   communityInvitationRequest,
//   registration,
//   communityJoin,
  conversation,
//   message,
//   convesationUsers,
//   address,
//   addressTypes,
//   userAddress,
//   searchBlog,
//   searchCommunity,
//   forumCategories,
//   workplace,
//   userWorkPlaces,
//   communityBans,
//   communityHistory,
//   notificationTypes,
//   userNotificationTypes,
location,
]
export default function (app: Application): void {
  services.forEach(service => app.configure(service));
  app.configure(location);
}
