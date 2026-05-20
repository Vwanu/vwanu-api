import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { Application as FeathersApplication } from '@feathersjs/feathers';

import { UserNotificationPreference } from '../../database/user-notification-preference';
import { DeviceToken } from '../../database/device-token';
import { PushTicket } from '../../database/push-ticket';
import { Notification } from '../../database/notification';
import { EntityType } from '../../types/enums';
import { NotificationSlug } from '../../types/notifications';
import {
  notificationTypeIdFor,
  notificationLabelFor,
} from '../notification/notificationTypeCache';

export interface NotificationPayload {
  userId: string;
  fromUserId: string;
  slug: NotificationSlug;
  message?: string;
  type?: string;
  entityName?: EntityType;
  entityId?: string;
}

const expo = new Expo();

export class NotificationService {
  public static async create(
    app: FeathersApplication,
    payload: NotificationPayload,
  ): Promise<Notification | null> {
    if (payload.fromUserId === payload.userId) return null;

    const typeId = await notificationTypeIdFor(payload.slug);

    const pref: UserNotificationPreference | null = await (
      UserNotificationPreference as any
    ).findOne({
      where: { user_id: payload.userId, notification_type_id: typeId },
    });

    if (!pref?.in_app) return null;

    const notification: Notification = await app
      .service('notifications')
      .create({
        userId: payload.userId,
        fromUserId: payload.fromUserId,
        notificationTypeId: typeId,
        message: payload.message,
        type: payload.type,
        entityName: payload.entityName,
        entityId: payload.entityId,
      });

    if (pref.push) {
      sendPushNotifications(payload, notification).catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[NotificationService] push send failed', {
          userId: payload.userId,
          slug: payload.slug,
          err,
        });
      });
    }

    return notification;
  }

  public static async shouldNotifyUser(
    userId: string,
    notificationSlug: NotificationSlug,
    channel: 'in_app' | 'push',
  ): Promise<boolean> {
    try {
      const typeId = await notificationTypeIdFor(notificationSlug);
      const pref: UserNotificationPreference | null = await (
        UserNotificationPreference as any
      ).findOne({
        where: { user_id: userId, notification_type_id: typeId },
      });
      if (!pref) return false;
      return channel === 'in_app' ? pref.in_app : pref.push;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[NotificationService.shouldNotifyUser] failed', {
        userId,
        notificationSlug,
        channel,
        error,
      });
      return false;
    }
  }
}

async function sendPushNotifications(
  payload: NotificationPayload,
  notification: Notification,
): Promise<void> {
  // @ts-ignore
  const tokens: DeviceToken[] = await DeviceToken.findAll({
    where: { user_id: payload.userId },
  });
  if (tokens.length === 0) return;

  const title = await notificationLabelFor(payload.slug);
  const body = payload.message ?? '';

  const items = tokens.map((t) => ({
    token: t,
    message: {
      to: t.token,
      title,
      body,
      data: {
        notificationId: notification.id,
        entityName: payload.entityName,
        entityId: payload.entityId,
        fromUserId: payload.fromUserId,
        slug: payload.slug,
      },
    } as ExpoPushMessage,
  }));

  for (let i = 0; i < items.length; i += 100) {
    const chunk = items.slice(i, i + 100);
    try {
      const tickets: ExpoPushTicket[] = await expo.sendPushNotificationsAsync(
        chunk.map((it) => it.message),
      );
      const rows = tickets.map((ticket, idx) => {
        if (ticket.status === 'ok') {
          return {
            ticketId: ticket.id,
            deviceTokenId: chunk[idx].token.id,
            notificationId: notification.id,
            status: 'queued' as const,
          };
        }
        return {
          ticketId: null,
          deviceTokenId: chunk[idx].token.id,
          notificationId: notification.id,
          status: 'error' as const,
          errorCode: ticket.details?.error ?? ticket.message ?? 'unknown',
        };
      });
      // @ts-ignore
      await PushTicket.bulkCreate(rows);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[NotificationService] Expo chunk send failed', {
        chunkSize: chunk.length,
        err,
      });
    }
  }
}
