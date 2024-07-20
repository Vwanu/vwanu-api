
import { Id, HookContext } from '@feathersjs/feathers';



type sendNotification = { message: string, userId: Id, toId: Id, type: string, entityName: 'posts' | 'comments', entityId: Id, notificationType: 'new_comment' | 'new_request' }

export default (data: sendNotification) => async (context: HookContext): Promise<HookContext> => {
    try {
        await context.app.service('notification').create({
            user_id: data.userId,
            to_user_id: data.toId,
            message: 'Commented on your post',
            type: data.type,
            entity_name: data.entityName,
            entit_id: data.entityId,
            notification_type: data.notificationType,
        });
    } catch (error) {
        throw new Error(error);
    }

    return context;
}