import { NotificationType } from '../../database/notifications_types';
import { NotificationSlug } from '../../types/notifications';

/**
 * Lazy-async cache mapping `NotificationSlug → notification_types.id`.
 * The first caller triggers the lookup; subsequent callers hit the cached
 * promise. Avoids a SELECT-per-emit on the small lookup table without
 * requiring startup-time initialization.
 *
 * New types added via migration require an app restart to be visible —
 * that's acceptable because adding a slug also requires a code change
 * (NotificationSlug enum + DEFAULT_PREFERENCES entry), so the deploy and
 * the seed land together.
 */
let cachePromise: Promise<Record<string, number>> | null = null;

const buildCache = async (): Promise<Record<string, number>> => {
  // @ts-ignore sequelize-typescript static methods not exposed on the type
  const rows: NotificationType[] = await NotificationType.findAll();
  return Object.fromEntries(rows.map((r) => [r.slug, r.id as number]));
};

export const notificationTypeIdFor = async (
  slug: NotificationSlug,
): Promise<number> => {
  if (!cachePromise) cachePromise = buildCache();
  const cache = await cachePromise;
  const id = cache[slug];
  if (id == null) {
    throw new Error(
      `Unknown notification slug: ${slug}. Check the migration seed in ` +
        'migrations/data/notification_types_v2.js matches the NotificationSlug enum.',
    );
  }
  return id;
};

export const __resetCacheForTests = (): void => {
  cachePromise = null;
};
