import { z, object, string, TypeOf } from 'zod';

const validNotificationsNames = [
  'new_chat',
  'new_notification',
  'new_friend',
  'new_like',
  'new_comment',
  'new_follow',
  'new_comment_like',
  'new_comment_reply',
  'new_friend_request',
  'new_post_mention',
  'new_community_invitation',
  'new_blog_response',
];

export const createnotificationTypesSchema = object({
  body: object({
    notification_slug: string({
      error: (iss)=> iss.input===undefined
      ? 'Please provide notification slug'
      : 'Invalid notification slug',
    }),
    notification_name: string({
      error: (iss)=> iss.input===undefined
      ? 'Please provide notification name'
      : 'Invalid notification name',
    }),
    notification_description: string({
      error: (iss)=> iss.input===undefined
      ? 'Please provide a last name'
      : 'Invalid notification description',
    }),
  }).refine(
    (data) => validNotificationsNames.includes(data.notification_slug),
    {
      message: 'Invalid notification type slug',
      path: ['notification_name'],
    }
  ),
});

export const notificationTypesSchema = object({
  notification_slug: string({
    error: (iss)=> iss.input===undefined
    ? 'Please provide notification slug'
    : 'Invalid notification slug',
  }),
  notification_name: string({
    error: (iss)=> iss.input===undefined
    ? 'Please provide notification name'
    : 'Invalid notification name',
  }),
  notification_description: string({
    error: (iss)=> iss.input===undefined
    ?'Please provide a last name'
    : 'Invalid notification description',
  }),
});

/**
 * Represents the inferred type of the `notificationSettingsSchema`.
 * This type defines the structure of the notification settings.
 */
export type NotificationTypesInterface = z.infer<
  typeof notificationTypesSchema
>;
export type CreateNotificationTypesInput = TypeOf<
  typeof createnotificationTypesSchema
>;
