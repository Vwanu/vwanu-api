import { NotificationType } from '../../database/notifications_types';
import { NotificationSlug } from '../../types/notifications';

interface TypeCache {
  ids: Record<string, number>;
  labels: Record<string, string>;
}

let cachePromise: Promise<TypeCache> | null = null;

const buildCache = async (): Promise<TypeCache> => {
  // @ts-ignore
  const rows: NotificationType[] = await NotificationType.findAll();
  return {
    ids: Object.fromEntries(rows.map((r) => [r.slug, r.id as number])),
    labels: Object.fromEntries(rows.map((r) => [r.slug, r.label])),
  };
};

const ensureCache = (): Promise<TypeCache> => {
  if (!cachePromise) cachePromise = buildCache();
  return cachePromise;
};

export const notificationTypeIdFor = async (
  slug: NotificationSlug,
): Promise<number> => {
  const cache = await ensureCache();
  const id = cache.ids[slug];
  if (id == null) {
    throw new Error(
      `Unknown notification slug: ${slug}. Check migrations/data/notification_types_v2.js matches the NotificationSlug enum.`,
    );
  }
  return id;
};

export const notificationLabelFor = async (
  slug: NotificationSlug,
): Promise<string> => {
  const cache = await ensureCache();
  return cache.labels[slug] ?? slug;
};

export const __resetCacheForTests = (): void => {
  cachePromise = null;
};
