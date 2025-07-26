/**
 * Example usage of the notification system
 */

import { NotificationSlug } from '../../types/enums';
import { UserNotificationTypes } from '../../database/user_notification_types';
// import { UserNotificationSettings } from '../../database/user_notifications_settings';

// Example: When a new post is created and mentions users
export async function handleNewPostWithMentions(
  postId: string,
  authorId: string,
  mentionedUserIds: string[]
) {
  console.log(`Processing notifications for new post ${postId} by ${authorId}`);
  
  for (const userId of mentionedUserIds) {
    // Check user preferences
    const preferences = await getUserNotificationPreferences(userId, NotificationSlug.NEW_POST_MENTION);
    
    if (preferences.shouldNotify) {
      console.log(`Notifying user ${userId} via channels:`, preferences.channels);
      
      // Send notifications based on enabled channels
      if (preferences.channels.includes('email')) {
        console.log('📧 Sending email notification');
        // await sendEmailNotification(userId, 'You were mentioned in a post', ...);
      }
      
      if (preferences.channels.includes('in_app')) {
        console.log('📱 Creating in-app notification');
        // await createInAppNotification(userId, ...);
      }
      
      if (preferences.channels.includes('sms')) {
        console.log('📱 Sending SMS notification');
        // await sendSMSNotification(userId, ...);
      }
      
      if (preferences.channels.includes('sound')) {
        console.log('🔔 Sound notification enabled');
        // Sound will be handled by client-side
      }
    } else {
      console.log(`User ${userId} has disabled notifications for post mentions`);
    }
  }
}

// Example: When someone comments on a user's post
export async function handleNewComment(
  postId: string,
  postAuthorId: string,
  commentAuthorId: string,
  commentId: string
) {
  if (postAuthorId === commentAuthorId) {
    console.log('User commented on their own post - no notification needed');
    return;
  }

  console.log(`Processing comment notification for post ${postId}`);
  
  const preferences = await getUserNotificationPreferences(postAuthorId, NotificationSlug.NEW_COMMENT);
  
  if (preferences.shouldNotify) {
    console.log(`Notifying post author ${postAuthorId} via:`, preferences.channels);
    
    // Send notifications based on preferences
    const notificationData = {
      postId,
      commentId,
      commentAuthorId,
      title: 'New comment on your post',
      message: 'Someone commented on your post'
    };
    
    await sendNotifications(postAuthorId, preferences.channels, notificationData);
  }
}

// Example: When someone likes a post
export async function handleNewLike(
  postId: string,
  postAuthorId: string,
  likerId: string
) {
  if (postAuthorId === likerId) {
    console.log('User liked their own post - no notification needed');
    return;
  }

  console.log(`Processing like notification for post ${postId}`);
  
  const preferences = await getUserNotificationPreferences(postAuthorId, NotificationSlug.NEW_LIKE);
  
  if (preferences.shouldNotify) {
    console.log(`Notifying post author ${postAuthorId} via:`, preferences.channels);
    
    const notificationData = {
      postId,
      likerId,
      title: 'Someone liked your post',
      message: 'Your post received a new like'
    };
    
    await sendNotifications(postAuthorId, preferences.channels, notificationData);
  }
}

// Helper function to get user notification preferences
async function getUserNotificationPreferences(
  userId: string, 
  notificationSlug: NotificationSlug
): Promise<{
  shouldNotify: boolean;
  channels: string[];
}> {
  try {
    // Try to find modern notification preferences first
    const modernPrefs:any = {}
    
    // await UserNotificationTypes.findOne({
    //   where: { userId, notificationSlug }
    // });

    if (modernPrefs) {
      const channels: string[] = [];
      
      if (modernPrefs.inApp) channels.push('in_app');
      if (modernPrefs.email) channels.push('email');
      if (modernPrefs.text) channels.push('sms');
      if (modernPrefs.sound) channels.push('sound');
      
      return {
        shouldNotify: channels.length > 0,
        channels
      };
    }

    // Fallback to legacy settings
    const legacyPrefs:any = {}
    // await UserNotificationSettings.findOne({
    //   where: { 
    //     userId, 
    //     notificationSettingId: notificationSlug 
    //   }
    // });

    if (legacyPrefs && !legacyPrefs.isDisabled()) {
      const channels: string[] = ['in_app']; // Always include in-app
      
      if (legacyPrefs.hasEmail()) channels.push('email');
      if (legacyPrefs.hasSound()) channels.push('sound');
      
      return {
        shouldNotify: true,
        channels
      };
    }

    // Default preferences if no settings exist
    return getDefaultPreferences(notificationSlug);

  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return getDefaultPreferences(notificationSlug);
  }
}

// Default notification preferences
function getDefaultPreferences(notificationSlug: NotificationSlug): {
  shouldNotify: boolean;
  channels: string[];
} {
  const defaults = {
    [NotificationSlug.NEW_CHAT]: ['in_app', 'sound'],
    [NotificationSlug.NEW_FRIEND_REQUEST]: ['in_app', 'email', 'sound'],
    [NotificationSlug.NEW_FOLLOW]: ['in_app', 'sound'],
    [NotificationSlug.NEW_LIKE]: ['in_app'],
    [NotificationSlug.NEW_COMMENT]: ['in_app', 'email', 'sound'],
    [NotificationSlug.NEW_COMMENT_REPLY]: ['in_app', 'email', 'sound'],
    [NotificationSlug.NEW_POST_MENTION]: ['in_app', 'email', 'sound'],
    [NotificationSlug.NEW_COMMUNITY_INVITATION]: ['in_app', 'email', 'sound'],
    [NotificationSlug.NEW_BLOG_RESPONSE]: ['in_app', 'sound'],
    [NotificationSlug.NEW_FRIEND]: ['in_app', 'sound'],
    [NotificationSlug.NEW_COMMENT_LIKE]: ['in_app'],
    [NotificationSlug.NEW_NOTIFICATION]: ['in_app', 'sound'],
  };

  const channels = defaults[notificationSlug] || ['in_app'];
  
  return {
    shouldNotify: true,
    channels
  };
}

// Helper function to send notifications through various channels
async function sendNotifications(
  userId: string, 
  channels: string[], 
  data: {
    title: string;
    message: string;
    [key: string]: unknown;
  }
) {
  for (const channel of channels) {
    try {
      switch (channel) {
        case 'in_app':
          console.log('📱 Creating in-app notification');
          // await createInAppNotification(userId, data);
          break;
        case 'email':
          console.log('📧 Sending email notification');
          // await sendEmailNotification(userId, data);
          break;
        case 'sms':
          console.log('📱 Sending SMS notification');
          // await sendSMSNotification(userId, data);
          break;
        case 'sound':
          console.log('🔔 Sound notification enabled');
          // Sound is handled client-side
          break;
        default:
          console.log(`Unknown notification channel: ${channel}`);
      }
    } catch (error) {
      console.error(`Failed to send ${channel} notification:`, error);
    }
  }
}

// Example of how to set up user notification preferences
export async function setupUserNotificationPreferences(userId: string) {
  console.log(`Setting up default notification preferences for user ${userId}`);
  
  // Create default preferences for all notification types
  const defaultPreferences = [
    {
      userId,
      notificationSlug: NotificationSlug.NEW_FRIEND_REQUEST,
      text: false,
      email: true,
      sound: true,
      inApp: true
    },
    {
      userId,
      notificationSlug: NotificationSlug.NEW_COMMENT,
      text: false,
      email: true,
      sound: true,
      inApp: true
    },
    {
      userId,
      notificationSlug: NotificationSlug.NEW_LIKE,
      text: false,
      email: false,
      sound: false,
      inApp: true
    },
    {
      userId,
      notificationSlug: NotificationSlug.NEW_FOLLOW,
      text: false,
      email: false,
      sound: true,
      inApp: true
    },
    // Add more default preferences as needed
  ];

  for (const pref of defaultPreferences) {
    try {
      await UserNotificationTypes.create(pref);
      console.log(`✓ Created preference for ${pref.notificationSlug}`);
    } catch (error) {
      console.error(`✗ Failed to create preference for ${pref.notificationSlug}:`, error);
    }
  }
}
