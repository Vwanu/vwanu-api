/**
 * Canonical notification taxonomy for the unified push + in-app notification
 * system (VWA-87).
 *
 * `NotificationSlug` is the single source of truth for what kinds of
 * notifications exist. The `notification_types` DB lookup table is seeded
 * from this enum via migration; the TypeScript type system enforces that
 * every slug has a corresponding `DEFAULT_PREFERENCES` entry, so adding a
 * new slug requires adding both a seed row (migration) and a default.
 *
 * Old enums this replaces:
 * - `NotificationType` (verb-y: post_like, friend_request) — was on the
 *   `notifications` table column. VWA-140 migrates to `notification_type_id`.
 * - `NotificationSlug` in `enums.ts` — was used by the dead
 *   `user_notification_types` table. That enum is being moved/renamed here.
 */

export enum NotificationSlug {
  // Direct/personal — push-on by default
  NEW_MESSAGE = 'new_message',

  // Social actions (someone interacted with you)
  NEW_FRIEND_REQUEST = 'new_friend_request',
  NEW_FRIEND_ACCEPT = 'new_friend_accept',
  NEW_FOLLOW = 'new_follow',
  NEW_VISIT = 'new_visit',

  // Content engagement
  NEW_LIKE = 'new_like',
  NEW_COMMENT = 'new_comment',
  NEW_COMMENT_LIKE = 'new_comment_like',
  NEW_COMMENT_REPLY = 'new_comment_reply',
  NEW_POST_MENTION = 'new_post_mention',

  // Blog
  NEW_BLOG_LIKE = 'new_blog_like',
  NEW_BLOG_COMMENT = 'new_blog_comment',
  NEW_BLOG_RESPONSE = 'new_blog_response',

  // Community
  NEW_COMMUNITY_INVITATION = 'new_community_invitation',
  NEW_COMMUNITY_JOIN = 'new_community_join',
  NEW_COMMUNITY_POST = 'new_community_post',
  NEW_COMMUNITY_MENTION = 'new_community_mention',

  // System
  SYSTEM_UPDATE = 'system_update',
  SECURITY_ALERT = 'security_alert',
}

export interface NotificationTypeSeed {
  slug: NotificationSlug;
  label: string;
  description: string;
}

/**
 * Seed data for the `notification_types` lookup table. The migration in
 * VWA-140 bulkInserts this list; adding a new entry here + a new
 * `DEFAULT_PREFERENCES` entry is the complete contract for introducing a
 * new notification kind.
 */
export const NOTIFICATION_TYPE_SEEDS: NotificationTypeSeed[] = [
  { slug: NotificationSlug.NEW_MESSAGE, label: 'New message', description: 'When someone sends you a direct message' },
  { slug: NotificationSlug.NEW_FRIEND_REQUEST, label: 'New friend request', description: 'When someone sends you a friend request' },
  { slug: NotificationSlug.NEW_FRIEND_ACCEPT, label: 'Friend request accepted', description: 'When someone accepts your friend request' },
  { slug: NotificationSlug.NEW_FOLLOW, label: 'New follower', description: 'When someone follows you' },
  { slug: NotificationSlug.NEW_VISIT, label: 'Profile visit', description: 'When someone visits your profile' },
  { slug: NotificationSlug.NEW_LIKE, label: 'New like', description: 'When someone likes your post' },
  { slug: NotificationSlug.NEW_COMMENT, label: 'New comment', description: 'When someone comments on your post' },
  { slug: NotificationSlug.NEW_COMMENT_LIKE, label: 'Comment liked', description: 'When someone likes your comment' },
  { slug: NotificationSlug.NEW_COMMENT_REPLY, label: 'Comment reply', description: 'When someone replies to your comment' },
  { slug: NotificationSlug.NEW_POST_MENTION, label: 'Post mention', description: 'When someone mentions you in a post' },
  { slug: NotificationSlug.NEW_BLOG_LIKE, label: 'Blog liked', description: 'When someone likes your blog post' },
  { slug: NotificationSlug.NEW_BLOG_COMMENT, label: 'Blog comment', description: 'When someone comments on your blog' },
  { slug: NotificationSlug.NEW_BLOG_RESPONSE, label: 'Blog response', description: 'When someone responds to your blog' },
  { slug: NotificationSlug.NEW_COMMUNITY_INVITATION, label: 'Community invitation', description: 'When you are invited to a community' },
  { slug: NotificationSlug.NEW_COMMUNITY_JOIN, label: 'New community member', description: 'When someone joins a community you manage' },
  { slug: NotificationSlug.NEW_COMMUNITY_POST, label: 'New community post', description: 'When a new post is made in a community you follow' },
  { slug: NotificationSlug.NEW_COMMUNITY_MENTION, label: 'Community mention', description: 'When you are mentioned in a community post' },
  { slug: NotificationSlug.SYSTEM_UPDATE, label: 'System update', description: 'Important system announcements' },
  { slug: NotificationSlug.SECURITY_ALERT, label: 'Security alert', description: 'Security-related notifications about your account' },
];

export interface NotificationPreferenceDefault {
  in_app: boolean;
  push: boolean;
}

/**
 * Per-slug default preferences applied at user-signup and during the
 * initial backfill. v1 strategy: push-on only for direct messages; all
 * other types are in-app only by default. Users opt into more push
 * channels via the settings screen (VWA-145).
 *
 * Typed as `Record<NotificationSlug, ...>` so the compiler refuses to
 * build if a new slug is added without a corresponding default.
 */
export const DEFAULT_PREFERENCES: Record<NotificationSlug, NotificationPreferenceDefault> = {
  [NotificationSlug.NEW_MESSAGE]: { in_app: true, push: true },

  [NotificationSlug.NEW_FRIEND_REQUEST]: { in_app: true, push: false },
  [NotificationSlug.NEW_FRIEND_ACCEPT]: { in_app: true, push: false },
  [NotificationSlug.NEW_FOLLOW]: { in_app: true, push: false },
  [NotificationSlug.NEW_VISIT]: { in_app: true, push: false },

  [NotificationSlug.NEW_LIKE]: { in_app: true, push: false },
  [NotificationSlug.NEW_COMMENT]: { in_app: true, push: false },
  [NotificationSlug.NEW_COMMENT_LIKE]: { in_app: true, push: false },
  [NotificationSlug.NEW_COMMENT_REPLY]: { in_app: true, push: false },
  [NotificationSlug.NEW_POST_MENTION]: { in_app: true, push: false },

  [NotificationSlug.NEW_BLOG_LIKE]: { in_app: true, push: false },
  [NotificationSlug.NEW_BLOG_COMMENT]: { in_app: true, push: false },
  [NotificationSlug.NEW_BLOG_RESPONSE]: { in_app: true, push: false },

  [NotificationSlug.NEW_COMMUNITY_INVITATION]: { in_app: true, push: false },
  [NotificationSlug.NEW_COMMUNITY_JOIN]: { in_app: true, push: false },
  [NotificationSlug.NEW_COMMUNITY_POST]: { in_app: true, push: false },
  [NotificationSlug.NEW_COMMUNITY_MENTION]: { in_app: true, push: false },

  [NotificationSlug.SYSTEM_UPDATE]: { in_app: true, push: false },
  [NotificationSlug.SECURITY_ALERT]: { in_app: true, push: true },
};

/**
 * Hard-coded mapping from the legacy `NotificationType` enum values (which
 * live as strings in `notifications.notification_type`) to the new slug.
 * Used by the migration to backfill `notifications.notification_type_id`.
 *
 * Sourced from `src/types/enums.ts`'s NotificationType:
 *   COMMUNITY_INVITE, COMMUNITY_JOIN, COMMUNITY_POST, COMMUNITY_MENTION,
 *   FRIEND_REQUEST, FRIEND_ACCEPT, FOLLOW, VISIT,
 *   POST_LIKE, POST_COMMENT, BLOG_LIKE, BLOG_COMMENT,
 *   SYSTEM_UPDATE, SECURITY_ALERT
 */
export const LEGACY_NOTIFICATION_TYPE_TO_SLUG: Record<string, NotificationSlug> = {
  community_invite: NotificationSlug.NEW_COMMUNITY_INVITATION,
  community_join: NotificationSlug.NEW_COMMUNITY_JOIN,
  community_post: NotificationSlug.NEW_COMMUNITY_POST,
  community_mention: NotificationSlug.NEW_COMMUNITY_MENTION,
  friend_request: NotificationSlug.NEW_FRIEND_REQUEST,
  friend_accept: NotificationSlug.NEW_FRIEND_ACCEPT,
  follow: NotificationSlug.NEW_FOLLOW,
  visit: NotificationSlug.NEW_VISIT,
  post_like: NotificationSlug.NEW_LIKE,
  post_comment: NotificationSlug.NEW_COMMENT,
  blog_like: NotificationSlug.NEW_BLOG_LIKE,
  blog_comment: NotificationSlug.NEW_BLOG_COMMENT,
  system_update: NotificationSlug.SYSTEM_UPDATE,
  security_alert: NotificationSlug.SECURITY_ALERT,
};
