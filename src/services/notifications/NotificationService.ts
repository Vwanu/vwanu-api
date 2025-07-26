import { UserNotificationTypes } from '../../database/user_notification_types';
import { UserNotificationSettings } from '../../database/user_notifications_settings';
import { NotificationSlug } from '../../types/enums';

export interface NotificationPayload {
  userId: string;
  notificationSlug: NotificationSlug;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface NotificationChannels {
  inApp: boolean;
  email: boolean;
  sms: boolean;
  sound: boolean;
  push: boolean;
}

export class NotificationService {
  
  /**
   * Check if a user should be notified for a specific event and channel
   */
  public static async shouldNotifyUser(
    userId: string, 
    notificationSlug: NotificationSlug, 
    channel: keyof NotificationChannels
  ): Promise<boolean> {
    try {
      // First check UserNotificationTypes (modern preference system)
      const userNotificationType = await UserNotificationTypes.findOne({
        where: { userId, notificationSlug }
      });

      if (userNotificationType) {
        switch (channel) {
          case 'inApp':
            return userNotificationType.inApp;
          case 'email':
            return userNotificationType.email;
          case 'sms':
            return userNotificationType.text;
          case 'sound':
            return userNotificationType.sound;
          case 'push':
            return userNotificationType.inApp; // Push follows in-app setting
          default:
            return false;
        }
      }

      // Fallback to UserNotificationSettings (legacy system)
      const userNotificationSetting = await UserNotificationSettings.findOne({
        where: { 
          userId, 
          notificationSettingId: notificationSlug 
        }
      });

      if (userNotificationSetting) {
        if (userNotificationSetting.isDisabled()) return false;
        
        switch (channel) {
          case 'email':
            return userNotificationSetting.hasEmail();
          case 'sound':
            return userNotificationSetting.hasSound();
          case 'inApp':
          case 'push':
            return userNotificationSetting.isEnabled();
          case 'sms':
            return false; // Legacy system doesn't support SMS
          default:
            return false;
        }
      }

      // Default behavior if no settings exist
      return this.getDefaultChannelSetting(notificationSlug, channel);
    } catch (error) {
      console.error('Error checking notification preference:', error);
      return false;
    }
  }

  /**
   * Get all enabled notification channels for a user and event
   */
  public static async getEnabledChannels(
    userId: string, 
    notificationSlug: NotificationSlug
  ): Promise<NotificationChannels> {
    const channels: NotificationChannels = {
      inApp: false,
      email: false,
      sms: false,
      sound: false,
      push: false,
    };

    for (const channel of Object.keys(channels) as Array<keyof NotificationChannels>) {
      channels[channel] = await this.shouldNotifyUser(userId, notificationSlug, channel);
    }

    return channels;
  }

  /**
   * Process a notification event and determine how to notify the user
   */
  public static async processNotification(payload: NotificationPayload): Promise<{
    shouldNotify: boolean;
    channels: NotificationChannels;
    methods: string[];
  }> {
    const channels = await this.getEnabledChannels(payload.userId, payload.notificationSlug);
    const enabledMethods = Object.entries(channels)
      .filter(([_, enabled]) => enabled)
      .map(([method]) => method);

    return {
      shouldNotify: enabledMethods.length > 0,
      channels,
      methods: enabledMethods,
    };
  }

  /**
   * Send notification through enabled channels
   */
  public static async sendNotification(payload: NotificationPayload): Promise<{
    sent: boolean;
    channels: string[];
    errors: string[];
  }> {
    const result = await this.processNotification(payload);
    
    if (!result.shouldNotify) {
      return {
        sent: false,
        channels: [],
        errors: ['User has disabled notifications for this event type']
      };
    }

    const sentChannels: string[] = [];
    const errors: string[] = [];

    // Send through each enabled channel
    for (const method of result.methods) {
      try {
        switch (method) {
          case 'inApp':
            await this.sendInAppNotification(payload);
            sentChannels.push('inApp');
            break;
          case 'email':
            await this.sendEmailNotification(payload);
            sentChannels.push('email');
            break;
          case 'sms':
            await this.sendSMSNotification(payload);
            sentChannels.push('sms');
            break;
          case 'push':
            await this.sendPushNotification(payload);
            sentChannels.push('push');
            break;
          // Sound is handled client-side
          case 'sound':
            sentChannels.push('sound');
            break;
        }
      } catch (error) {
        errors.push(`Failed to send ${method}: ${error}`);
      }
    }

    return {
      sent: sentChannels.length > 0,
      channels: sentChannels,
      errors
    };
  }

  /**
   * Get default channel settings for notification types
   */
  private static getDefaultChannelSetting(
    notificationSlug: NotificationSlug, 
    channel: keyof NotificationChannels
  ): boolean {
    // Define default preferences for different notification types
    const defaults: Record<NotificationSlug, NotificationChannels> = {
      [NotificationSlug.NEW_CHAT]: { inApp: true, email: false, sms: false, sound: true, push: true },
      [NotificationSlug.NEW_FRIEND_REQUEST]: { inApp: true, email: true, sms: false, sound: true, push: true },
      [NotificationSlug.NEW_FOLLOW]: { inApp: true, email: false, sms: false, sound: true, push: true },
      [NotificationSlug.NEW_LIKE]: { inApp: true, email: false, sms: false, sound: false, push: true },
      [NotificationSlug.NEW_COMMENT]: { inApp: true, email: true, sms: false, sound: true, push: true },
      [NotificationSlug.NEW_COMMENT_REPLY]: { inApp: true, email: true, sms: false, sound: true, push: true },
      [NotificationSlug.NEW_POST_MENTION]: { inApp: true, email: true, sms: false, sound: true, push: true },
      [NotificationSlug.NEW_COMMUNITY_INVITATION]: { inApp: true, email: true, sms: false, sound: true, push: true },
      [NotificationSlug.NEW_BLOG_RESPONSE]: { inApp: true, email: false, sms: false, sound: true, push: true },
      [NotificationSlug.NEW_FRIEND]: { inApp: true, email: false, sms: false, sound: true, push: true },
      [NotificationSlug.NEW_COMMENT_LIKE]: { inApp: true, email: false, sms: false, sound: false, push: true },
      [NotificationSlug.NEW_NOTIFICATION]: { inApp: true, email: false, sms: false, sound: true, push: true },
    };

    return defaults[notificationSlug]?.[channel] ?? false;
  }

  // Placeholder methods for actual notification sending
  private static async sendInAppNotification(payload: NotificationPayload): Promise<void> {
    // Implementation would store notification in database for in-app display
    console.log('Sending in-app notification:', payload);
  }

  private static async sendEmailNotification(payload: NotificationPayload): Promise<void> {
    // Implementation would send email via email service
    console.log('Sending email notification:', payload);
  }

  private static async sendSMSNotification(payload: NotificationPayload): Promise<void> {
    // Implementation would send SMS via SMS service
    console.log('Sending SMS notification:', payload);
  }

  private static async sendPushNotification(payload: NotificationPayload): Promise<void> {
    // Implementation would send push notification via push service
    console.log('Sending push notification:', payload);
  }
}

// Convenience functions for common events
export class NotificationEvents {
  
  public static async notifyNewPost(authorId: string, postId: string, mentionedUserIds: string[] = []): Promise<void> {
    // Notify mentioned users
    for (const userId of mentionedUserIds) {
      await NotificationService.sendNotification({
        userId,
        notificationSlug: NotificationSlug.NEW_POST_MENTION,
        title: 'You were mentioned in a post',
        message: 'Someone mentioned you in their post',
        data: { postId, authorId }
      });
    }
  }

  public static async notifyNewComment(postAuthorId: string, commentAuthorId: string, postId: string, commentId: string): Promise<void> {
    if (postAuthorId === commentAuthorId) return; // Don't notify self

    await NotificationService.sendNotification({
      userId: postAuthorId,
      notificationSlug: NotificationSlug.NEW_COMMENT,
      title: 'New comment on your post',
      message: 'Someone commented on your post',
      data: { postId, commentId, commentAuthorId }
    });
  }

  public static async notifyNewLike(postAuthorId: string, likerId: string, postId: string): Promise<void> {
    if (postAuthorId === likerId) return; // Don't notify self

    await NotificationService.sendNotification({
      userId: postAuthorId,
      notificationSlug: NotificationSlug.NEW_LIKE,
      title: 'Someone liked your post',
      message: 'Your post received a new like',
      data: { postId, likerId }
    });
  }

  public static async notifyFriendRequest(receiverId: string, senderId: string): Promise<void> {
    await NotificationService.sendNotification({
      userId: receiverId,
      notificationSlug: NotificationSlug.NEW_FRIEND_REQUEST,
      title: 'New friend request',
      message: 'You have a new friend request',
      data: { senderId }
    });
  }

  public static async notifyNewFollower(followedUserId: string, followerId: string): Promise<void> {
    await NotificationService.sendNotification({
      userId: followedUserId,
      notificationSlug: NotificationSlug.NEW_FOLLOW,
      title: 'New follower',
      message: 'Someone started following you',
      data: { followerId }
    });
  }

  public static async notifyCommunityInvitation(invitedUserId: string, inviterId: string, communityId: string): Promise<void> {
    await NotificationService.sendNotification({
      userId: invitedUserId,
      notificationSlug: NotificationSlug.NEW_COMMUNITY_INVITATION,
      title: 'Community invitation',
      message: 'You have been invited to join a community',
      data: { inviterId, communityId }
    });
  }
}
