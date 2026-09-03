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
  MESSAGE = 'Message',
  USER = 'User',
  FRIENDSHIP = 'Friendship'
}

export enum PrivacyType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  FRIENDS = 'friends'
}

// VWA-140: the old NotificationType + NotificationSlug + NotificationChannel
// enums were removed. The canonical notification taxonomy now lives in
// `src/types/notifications.ts` (NotificationSlug enum + DEFAULT_PREFERENCES).
// notification_types is a DB lookup table seeded from that file.

export enum ConversationType {
  DIRECT = 'direct',
  GROUP = 'group'
}

export enum FriendshipStatus {
  PENDING = 0,
  ACCEPTED = 1,
  DENIED = 2
}
