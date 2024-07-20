/* eslint-disable no-unused-vars */
import { HookContext } from "@feathersjs/feathers";

import Logger from "./logger";
import Services from "./servicesNames";
import Event from "./notificationEvent";
import EventData from "./NotificationEventData";


/**
 * @class BaseNotificationPublisher
 * @description Abstract class representing a base notification publisher.
 * @template T - The type of event.
 */
/**
 * Base class for notification publishers.
 * @template T - The event type.
 */
/**
 * Represents a base class for notification publishers.
 * @template T - The type of the event.
 */
export default abstract class BaseNotificationPublisher<T extends Event> {
    /**
     * @property message - The notification message.
     */
    private _message: T['message'];
    /**
     * @property type - The type of notification reach-out.
     */
    abstract type: T['type'];
    /**
     * @property entityName - The name of the entity associated with the notification.
     */
    abstract entityName: T['entityName'];
    /**
     * @property notificationType - The type of notification event.
     */
    abstract notificationType: T['notificationType'];

    /**
     * Creates a new instance of the BaseNotificationPublisher class.
     * @param context - The hook context.
     */
    constructor(protected context: HookContext) {
        this.context = context;
    }

    /**
     * Sets the notification message.
     * @param message - The notification message.
     */
    set message(message: T['message']) {
        this._message = message;
    }

    /**
     * Publishes a notification.
     * @param data - The data to be included in the notification.
     */
    async publish(data: EventData): Promise<void> {
        try {
            await this
                .context
                .app
                .service(Services.Notifications)
                .create({
                    message: this._message,
                    type: this.type,
                    entityName: this.entityName,
                    notificationType: this.notificationType,
                    ...data
                });
        } catch (error) {
            Logger.error(error);
        }
    }
}