import { z, object, string, number, TypeOf } from 'zod';

const validNotificationStatus = ['sound', 'email', 'sound_email', 'disable'];

export const createuserNotificationSettingsSchema = object({
  body: object({
    user_id: number({
       error: (iss)=> iss.input===undefined
      ? 'Please provide the user id'
      : 'Invalid user id',
    }),
    notification_setting_id: number({
       error: (iss)=> iss.input===undefined
       ? 'Please provide the notification setting id'
       : 'Invalid notification setting id',
    }),
    notification_status: string({
       error: (iss)=> iss.input===undefined
      ? 'Please provide the notification status'
      : 'Invalid notification status',
    }),
  }).refine(
    (data) => validNotificationStatus.includes(data.notification_status),
    {
      message: 'Invalid notification setting  name',
      path: ['notification_status'],
    }
  ),
});

export const userNotificationSettingsSchema = object({
  user_id: number({}),
  notification_setting_id: number({}),
  notification_status: string({}),
});

export type UserNotificationSettingsInterface = z.infer<
  typeof userNotificationSettingsSchema
>;
export type CreateuserNotificationSettingsSchemarInput = TypeOf<
  typeof createuserNotificationSettingsSchema
>['body'];
