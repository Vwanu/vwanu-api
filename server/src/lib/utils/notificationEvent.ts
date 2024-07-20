import NotificationMessage from "./notificationMessage";
import NotificationReachOutTypes from "./notificationReachOutTypes";
import Services from "./servicesNames";
import NotificationEvents from "./notificationEvents";


/**
 * @interface Event
 * @description Event interface representing a notification event.
 * @field message - The notification message.
 * @field type - The type of notification reach-out.
 * @field entityName - The name of the entity associated with the notification.
 * @field notificationType - The type of notification event.
 * @field data - Additional data associated with the event.
 */
interface Event {
    message: NotificationMessage;
    type: NotificationReachOutTypes;
    entityName: Services;
    notificationType: NotificationEvents;
}

export default Event;