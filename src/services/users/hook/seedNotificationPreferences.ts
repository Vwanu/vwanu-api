import { HookContext } from '@feathersjs/feathers';

import { NotificationType } from '../../../database/notifications_types';
import { UserNotificationPreference } from '../../../database/user-notification-preference';
import {
  DEFAULT_PREFERENCES,
  NotificationSlug,
} from '../../../types/notifications';

/**
 * After a user is created, seed one `user_notification_preference` row per
 * notification type using `DEFAULT_PREFERENCES`.
 *
 * Replaces the database trigger `fn_add_user_notification` (which was
 * supposed to do this server-side but never actually existed in prod — see
 * migration 20240609110320). Pulling this into application code makes the
 * defaults reviewable and testable, and removes the hidden-behavior risk
 * of DB triggers.
 *
 * Errors here are logged but do not block user creation — a user without
 * notification rows still works (every read falls through to skipping
 * notifications until the rows exist), and an admin can backfill if needed.
 */
const seedNotificationPreferences = async (
  context: HookContext,
): Promise<HookContext> => {
  if (!context.result?.id) return context;

  try {
    // @ts-ignore sequelize-typescript static methods not exposed on the type
    const types: NotificationType[] = await NotificationType.findAll();

    const rows = types.map((t) => {
      const slug = t.slug as NotificationSlug;
      const defaults = DEFAULT_PREFERENCES[slug];

      // If a row exists in the lookup table but not in DEFAULT_PREFERENCES,
      // fall back to in_app=true, push=false (safe defaults). Logged so we
      // notice the drift.
      if (!defaults) {
        // eslint-disable-next-line no-console
        console.warn(
          `[seedNotificationPreferences] notification_types row with slug '${slug}' ` +
            'has no DEFAULT_PREFERENCES entry; using safe fallback.',
        );
      }

      return {
        userId: context.result.id,
        notificationTypeId: t.id,
        in_app: defaults?.in_app ?? true,
        push: defaults?.push ?? false,
      };
    });

    // @ts-ignore sequelize-typescript static methods not exposed on the type
    await UserNotificationPreference.bulkCreate(rows, { ignoreDuplicates: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `[seedNotificationPreferences] Failed to seed prefs for user ${context.result.id}:`,
      error,
    );
  }

  return context;
};

export default seedNotificationPreferences;
