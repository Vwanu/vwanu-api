/**
 * A before hook for the 'create' method of the 'friendRequest' service.
 * Sets the 'requester_id' and 'receiver_id' properties of the data object.
 * Deletes the 'UserID' property from the data object.
 * @param context - The hook context.
 * @returns The modified hook context.
 */
import { HookContext } from '@feathersjs/feathers';


export default function (context: HookContext): HookContext {
    const { data } = context;
    data.requester_id = context.params.User.id;
    data.receiver_id = data.UserID;
    delete data.UserID;
    return context;
}