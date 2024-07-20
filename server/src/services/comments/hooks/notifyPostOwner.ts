/**
 * This hook sends a notification to the owner of a post when a new comment is made on the post or a comment was edited or deleted.
 * It uses the BaseNotificationPublisher class to publish the notification.
 */

/* eslint-disable camelcase */
import { HookContext } from "@feathersjs/feathers";
import BaseNotificationPublisher from "../../../lib/utils/basePublisher";
import NotificationMessage from "../../../lib/utils/notificationMessage";
import PostCommented from "../../../lib/utils/commentEvent";
import NotificationReachOutTypes from "../../../lib/utils/notificationReachOutTypes";
import Services from "../../../lib/utils/servicesNames";
import NotificationEvents from "../../../lib/utils/notificationEvents";

/**
 * Class representing a notification for a commented post.
 * Extends the BaseNotificationPublisher class.
 */
class PostCommentedNotification extends BaseNotificationPublisher<PostCommented> {
    type: PostCommented['type'] = NotificationReachOutTypes.Direct;
    entityName: PostCommented['entityName'] = Services.Posts;
    notificationType: PostCommented['notificationType'] = NotificationEvents.NewComment;
}

/**
 * Sends a notification to the owner of a post when a new comment is made on the post or a comment was updated or deleted.
 * @param context - The hook context.
 * @returns The modified hook context.
 */
export default async (context: HookContext): Promise<HookContext> => {
    const { app, result, method } = context;
    if (['create', 'patch', 'remove'].indexOf(method) === -1)
        throw new Error('Invalid method');

    const { UserId, PostId } = result;
    const { Post } = app.get('sequelizeClient').models;
    const post = await Post.findByPk(PostId);

    const notification = new PostCommentedNotification(context);
    switch (method) {
        case 'create':
            notification.message = NotificationMessage.PostCommented;
            break;
        case 'patch':
            notification.message = NotificationMessage.CommentEdited;
            break;
        case 'remove':
            notification.message = NotificationMessage.DeletedComment;
            break;
        default:
            throw new Error('Invalid method');
    }
    await notification.publish({
        UserId,
        ToUserId: post.UserId,
        EntityId: PostId,
    });
    return context;
}