import { Id } from "@feathersjs/feathers";

/**
 * Represents the data for a notification event.
 */
interface EventData {
    /**
     * The ID of the user who triggered the event.
     */
    UserId: Id;
    
    /**
     * The ID of the user who will receive the notification.
     */
    ToUserId: Id;
    
    /**
     * The ID of the entity related to the event.
     */
    EntityId: Id;
}

export default EventData;