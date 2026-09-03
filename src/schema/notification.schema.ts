import { z, object, string, boolean, number, TypeOf } from 'zod';
import { EntityType } from '../types/enums';

/**
 * Notification schema for a single notification.
 *
 * VWA-140 refactor:
 *   - `notificationType: NotificationType` (ENUM) → `notificationTypeId: number` (FK)
 *   - `viewed: boolean` → `readAt: Date | null`
 *
 * The numeric `notificationTypeId` is the FK into `notification_types`; the
 * frontend resolves it to a slug + label via the `/notification-types`
 * lookup endpoint (cached at app launch).
 */
export const NotificationSchema = z.object({
  id: string().uuid(),
  userId: string().uuid(),
  message: string().optional(),
  type: string().optional(),
  readAt: z.date().or(z.string()).nullable().optional(),
  entityName: z.nativeEnum(EntityType).optional(),
  entityId: string().uuid().optional(),
  notificationTypeId: number().int(),
  fromUserId: string().uuid().optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

/**
 * Schema for creating a new notification.
 *
 * Note: in production, this endpoint is locked behind
 * `disallow('external')` (see notification.hooks.ts) — all real creates
 * flow through NotificationService.create (VWA-141). This schema is kept
 * for internal validation and type generation.
 */
export const createNotificationSchema = object({
  body: object({
    userId: string({
      error: (iss) => iss.input === undefined ? 'User ID is required' : 'User ID must be a valid UUID',
    }).uuid(),
    message: string({
      error: (iss) => iss.input === undefined ? undefined : 'Message must be a string',
    }).optional(),
    type: string().optional(),
    entityName: z.nativeEnum(EntityType, {
      error: () => ({ message: 'Invalid entity type' }),
    }).optional(),
    entityId: string().uuid().optional(),
    notificationTypeId: number({
      error: (iss) => iss.input === undefined ? 'notificationTypeId is required' : 'notificationTypeId must be an integer',
    }).int(),
    fromUserId: string().uuid().optional(),
  }),
});

/**
 * Schema for getting a single notification
 */
export const getNotificationSchema = object({
  params: object({
    id: string({
      error: (iss) => iss.input === undefined ? 'Notification ID is required' : 'Notification ID must be a valid UUID',
    }).uuid(),
  }),
});

/**
 * Schema for updating/patching a notification.
 *
 * The only field external clients can patch is `readAt` (to mark a
 * notification as read). All other fields are immutable post-creation.
 */
export const updateNotificationSchema = object({
  params: object({
    id: string({
      error: (iss) => iss.input === undefined ? 'Notification ID is required' : 'Notification ID must be a valid UUID',
    }).uuid(),
  }),
  body: object({
    readAt: z.date().or(z.string()).nullable().optional(),
    // Legacy shortcut: accept `read: true` and let the hook stamp readAt = now().
    read: boolean().optional(),
  }),
});

/**
 * Schema for deleting a notification
 */
export const deleteNotificationSchema = object({
  params: object({
    id: string({
      error: (iss) => iss.input === undefined ? 'Notification ID is required' : 'Notification ID must be a valid UUID',
    }).uuid(),
  }),
});

/**
 * Schema for querying notifications (find)
 */
export const queryNotificationSchema = object({
  query: object({
    userId: string().uuid().optional(),
    // `read` is a virtual filter; true → readAt IS NOT NULL, false → readAt IS NULL
    read: z.union([boolean(), string()]).optional(),
    notificationTypeId: number().int().optional(),
    entityName: z.nativeEnum(EntityType).optional(),
    entityId: string().uuid().optional(),
    $limit: z.number().or(z.string().transform(Number)).optional(),
    $skip: z.number().or(z.string().transform(Number)).optional(),
    $sort: z.array(z.number()).optional(),
  }).optional(),
});

export type NotificationInterface = z.infer<typeof NotificationSchema>;
export type CreateNotificationInput = TypeOf<typeof createNotificationSchema>;
export type GetNotificationInput = TypeOf<typeof getNotificationSchema>;
export type UpdateNotificationInput = TypeOf<typeof updateNotificationSchema>;
export type DeleteNotificationInput = TypeOf<typeof deleteNotificationSchema>;
export type QueryNotificationInput = TypeOf<typeof queryNotificationSchema>;
