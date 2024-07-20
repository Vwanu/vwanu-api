
/**
 * A hook function that fills in additional data for notifications.
 * @param {HookContext} context - The hook context object.
 * @returns {Promise<HookContext>} The modified hook context object.
 */
import { HookContext } from '@feathersjs/feathers';
import NotificationEventData from '../../../lib/utils/NotificationEventData';
import NotificationEvent from '../../../lib/utils/notificationEvent';

type FullNotificationEventData = NotificationEventData & NotificationEvent;

export default async (context: HookContext): Promise<HookContext> => {
    const { data, app } = context;
    const parmeters = data as FullNotificationEventData;
    const sequelizeClient = app.get('sequelizeClient');

    const { notificationType } = parmeters;

    const dat = (await sequelizeClient.models.UserNotificationTypes.findOne({ where: { user_id: parmeters.ToUserId, notification_slug: notificationType } }));
    
    context.data.sound = dat?.sound || false;
    return context;
};