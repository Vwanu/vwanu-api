import { z, object, string, boolean, TypeOf } from 'zod';
import { NotificationType, EntityType } from '../types/enums';

/**
 * Notification schema for a single notification
 */
export const NotificationSchema = z.object({
  id: string().uuid(),
  userId: string().uuid(),
  message: string().optional(),
  type: string().optional(),
  viewed: boolean(),
  entityName: z.nativeEnum(EntityType).optional(),
  entityId: string().uuid().optional(),
  notificationType: z.nativeEnum(NotificationType),
  fromUserId: string().uuid().optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

/**
 * Schema for creating a new notification
 */
export const createNotificationSchema = object({
  body: object({
    userId: string({
      required_error: 'User ID is required',
      invalid_type_error: 'User ID must be a valid UUID',
    }).uuid(),
    message: string({
      invalid_type_error: 'Message must be a string',
    }).optional(),
    type: string().optional(),
    entityName: z.nativeEnum(EntityType, {
      errorMap: () => ({ message: 'Invalid entity type' }),
    }).optional(),
    entityId: string().uuid().optional(),
    notificationType: z.nativeEnum(NotificationType, {
      required_error: 'Notification type is required',
      errorMap: () => ({ message: 'Invalid notification type' }),
    }),
    fromUserId: string().uuid().optional(),
  }),
});

/**
 * Schema for getting a single notification
 */
export const getNotificationSchema = object({
  params: object({
    id: string({
      required_error: 'Notification ID is required',
      invalid_type_error: 'Notification ID must be a valid UUID',
    }).uuid(),
  }),
});

/**
 * Schema for updating/patching a notification
 */
export const updateNotificationSchema = object({
  params: object({
    id: string({
      required_error: 'Notification ID is required',
      invalid_type_error: 'Notification ID must be a valid UUID',
    }).uuid(),
  }),
  body: object({
    viewed: boolean().optional(),
    message: string().optional(),
    type: string().optional(),
  }),
});

/**
 * Schema for deleting a notification
 */
export const deleteNotificationSchema = object({
  params: object({
    id: string({
      required_error: 'Notification ID is required',
      invalid_type_error: 'Notification ID must be a valid UUID',
    }).uuid(),
  }),
});

/**
 * Schema for querying notifications (find)
 */
export const queryNotificationSchema = object({
  query: object({
    userId: string().uuid().optional(),
    viewed: z.union([boolean(), string()]).optional(),
    notificationType: z.nativeEnum(NotificationType).optional(),
    entityName: z.nativeEnum(EntityType).optional(),
    entityId: string().uuid().optional(),
    $limit: z.number().or(z.string().transform(Number)).optional(),
    $skip: z.number().or(z.string().transform(Number)).optional(),
    $sort: z.record(z.number()).optional(),
  }).optional(),
});

/**
 * TypeScript types inferred from schemas
 */
export type NotificationInterface = z.infer<typeof NotificationSchema>;
export type CreateNotificationInput = TypeOf<typeof createNotificationSchema>;
export type GetNotificationInput = TypeOf<typeof getNotificationSchema>;
export type UpdateNotificationInput = TypeOf<typeof updateNotificationSchema>;
export type DeleteNotificationInput = TypeOf<typeof deleteNotificationSchema>;
export type QueryNotificationInput = TypeOf<typeof queryNotificationSchema>;
