// Seed data for VWA-140's new `notification_types` lookup table.
// Source of truth: `src/types/notifications.ts` (NOTIFICATION_TYPE_SEEDS).
// Keep these in sync — adding a new slug requires editing both.
module.exports = [
  { slug: 'new_message', label: 'New message', description: 'When someone sends you a direct message' },
  { slug: 'new_friend_request', label: 'New friend request', description: 'When someone sends you a friend request' },
  { slug: 'new_friend_accept', label: 'Friend request accepted', description: 'When someone accepts your friend request' },
  { slug: 'new_follow', label: 'New follower', description: 'When someone follows you' },
  { slug: 'new_visit', label: 'Profile visit', description: 'When someone visits your profile' },
  { slug: 'new_like', label: 'New like', description: 'When someone likes your post' },
  { slug: 'new_comment', label: 'New comment', description: 'When someone comments on your post' },
  { slug: 'new_comment_like', label: 'Comment liked', description: 'When someone likes your comment' },
  { slug: 'new_comment_reply', label: 'Comment reply', description: 'When someone replies to your comment' },
  { slug: 'new_post_mention', label: 'Post mention', description: 'When someone mentions you in a post' },
  { slug: 'new_blog_like', label: 'Blog liked', description: 'When someone likes your blog post' },
  { slug: 'new_blog_comment', label: 'Blog comment', description: 'When someone comments on your blog' },
  { slug: 'new_blog_response', label: 'Blog response', description: 'When someone responds to your blog' },
  { slug: 'new_community_invitation', label: 'Community invitation', description: 'When you are invited to a community' },
  { slug: 'new_community_join', label: 'New community member', description: 'When someone joins a community you manage' },
  { slug: 'new_community_post', label: 'New community post', description: 'When a new post is made in a community you follow' },
  { slug: 'new_community_mention', label: 'Community mention', description: 'When you are mentioned in a community post' },
  { slug: 'system_update', label: 'System update', description: 'Important system announcements' },
  { slug: 'security_alert', label: 'Security alert', description: 'Security-related notifications about your account' },
];

// Per-slug defaults applied during the initial preference backfill.
// v1 strategy: push-on only for direct messages and security alerts.
module.exports.DEFAULT_PREFERENCES = {
  new_message: { in_app: true, push: true },
  new_friend_request: { in_app: true, push: false },
  new_friend_accept: { in_app: true, push: false },
  new_follow: { in_app: true, push: false },
  new_visit: { in_app: true, push: false },
  new_like: { in_app: true, push: false },
  new_comment: { in_app: true, push: false },
  new_comment_like: { in_app: true, push: false },
  new_comment_reply: { in_app: true, push: false },
  new_post_mention: { in_app: true, push: false },
  new_blog_like: { in_app: true, push: false },
  new_blog_comment: { in_app: true, push: false },
  new_blog_response: { in_app: true, push: false },
  new_community_invitation: { in_app: true, push: false },
  new_community_join: { in_app: true, push: false },
  new_community_post: { in_app: true, push: false },
  new_community_mention: { in_app: true, push: false },
  system_update: { in_app: true, push: false },
  security_alert: { in_app: true, push: true },
};

// Mapping from the legacy NotificationType enum values (stored as strings in
// notifications.notification_type) to the new slug. Used in migration C to
// backfill notification_type_id.
module.exports.LEGACY_TYPE_TO_SLUG = {
  community_invite: 'new_community_invitation',
  community_join: 'new_community_join',
  community_post: 'new_community_post',
  community_mention: 'new_community_mention',
  friend_request: 'new_friend_request',
  friend_accept: 'new_friend_accept',
  follow: 'new_follow',
  visit: 'new_visit',
  post_like: 'new_like',
  post_comment: 'new_comment',
  blog_like: 'new_blog_like',
  blog_comment: 'new_blog_comment',
  system_update: 'system_update',
  security_alert: 'security_alert',
};
