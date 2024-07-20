import NotificationMessage from "./notificationMessage";
import NotificationReachOutTypes from './notificationReachOutTypes';
import Services from './servicesNames';
import NotificationEvents from './notificationEvents';

export default interface PostCommented {
    message: NotificationMessage.PostCommented | NotificationMessage.CommentEdited | NotificationMessage.DeletedComment,
    type: NotificationReachOutTypes.Direct,
    entityName: Services.Posts,
    notificationType: NotificationEvents.NewComment,
}