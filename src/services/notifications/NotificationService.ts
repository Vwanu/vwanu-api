import { UserNotificationPreference } from '../../database/user-notification-preference';
import { NotificationSlug } from '../../types/notifications';
import { notificationTypeIdFor } from '../notification/notificationTypeCache';

/**
 * Notification gating helper.
 *
 * VWA-140 refactor: replaced the dual-table preference lookup (the
 * `UserNotificationTypes` modern table + `UserNotificationSettings` legacy
 * fallback) with a single read of `UserNotificationPreference` keyed by
 * (user_id, notification_type_id).
 *
 * VWA-141 will turn this into the full notification funnel — adding the
 * self-action guard, push delivery, ticket persistence, and locking down
 * direct callers to a single `create()` entry point. For now this exists
 * so the existing in-app notification flow keeps working.
 */

export interface NotificationPayload {
  userId: string;
  notificationSlug: NotificationSlug;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export type NotificationChannel = 'in_app' | 'push';

export class NotificationService {
  /**
   * Returns true iff the user has opted into the given channel for the
   * given notification type. Loads the cached `notification_types.id` for
   * the slug, then reads the user's preference row.
   */
  public static async shouldNotifyUser(
    userId: string,
    notificationSlug: NotificationSlug,
    channel: NotificationChannel,
  ): Promise<boolean> {
    try {
      const typeId = await notificationTypeIdFor(notificationSlug);
      const pref = await UserNotificationPreference.findOne({
        where: { user_id: userId, notification_type_id: typeId },
      });

      if (!pref) {
        // No row should ever be missing — signup seeds them via
        // seedNotificationPreferences. But if it is missing (race during
        // signup, manual user creation in a script, etc.), fail safe:
        // don't notify. The settings UI will surface the gap.
        return false;
      }

      switch (channel) {
        case 'in_app':
          return pref.in_app;
        case 'push':
          return pref.push;
        default:
          return false;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        '[NotificationService.shouldNotifyUser] preference lookup failed',
        { userId, notificationSlug, channel, error },
      );
      return false;
    }
  }
}
