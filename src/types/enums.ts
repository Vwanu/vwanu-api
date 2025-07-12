// Shared enums for database models

export enum CommunityPrivacyType {
  PUBLIC = 'public',
  HIDDEN = 'hidden',
  PRIVATE = 'private'
}

export enum CommunityPermissionLevel {
  ADMINS = 'A',        // All ADMINS
  MODERATORS = 'M',   // Moderators and above
  EVERYONE = 'E'     // Organizers/Admins only
}

export enum CommunityRoleType {
  MEMBER = 'member',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  OWNER = 'owner'
}

// You can add more shared enums here as needed
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

export enum CallStatus {
  INITIATED = 'initiated',
  ANSWERED = 'answered',
  DENIED = 'denied',
  CANCELED = 'canceled',
  ENDED = 'ended',
  CONNECTED = 'connected'
}

export enum CallType {
  VIDEO = 'video',
  AUDIO = 'audio'
}

export enum EntityType {
  POST = 'Post',
  BLOG = 'Blog',
  DISCUSSION = 'Discussion',
  COMMUNITY = 'Community',
  COMMENT = 'Comment',
  MESSAGE = 'Message'
}

export enum PrivacyType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  FRIENDS = 'friends'
}

export enum NotificationType {
  // Community notifications
  COMMUNITY_INVITE = 'community_invite',
  COMMUNITY_JOIN = 'community_join',
  COMMUNITY_POST = 'community_post',
  COMMUNITY_MENTION = 'community_mention',
  
  // Social notifications
  FRIEND_REQUEST = 'friend_request',
  FRIEND_ACCEPT = 'friend_accept',
  FOLLOW = 'follow',
  
  // Content notifications
  POST_LIKE = 'post_like',
  POST_COMMENT = 'post_comment',
  BLOG_LIKE = 'blog_like',
  BLOG_COMMENT = 'blog_comment',
  
  // System notifications
  SYSTEM_UPDATE = 'system_update',
  SECURITY_ALERT = 'security_alert'
}

export enum ConversationType {
  DIRECT = 'direct',
  GROUP = 'group'
}

export enum NotificationSlug {
  NEW_CHAT = 'new_chat',
  NEW_NOTIFICATION = 'new_notification',
  NEW_FRIEND = 'new_friend',
  NEW_LIKE = 'new_like',
  NEW_COMMENT = 'new_comment',
  NEW_FOLLOW = 'new_follow',
  NEW_COMMENT_LIKE = 'new_comment_like',
  NEW_COMMENT_REPLY = 'new_comment_reply',
  NEW_FRIEND_REQUEST = 'new_friend_request',
  NEW_POST_MENTION = 'new_post_mention',
  NEW_COMMUNITY_INVITATION = 'new_community_invitation',
  NEW_BLOG_RESPONSE = 'new_blog_response'
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push'
}
