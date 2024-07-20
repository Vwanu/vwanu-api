/**
 * Prevents creating a comment on a post route.
 * Throws a Forbidden error if the 'PostId' property is present in the data object.
 * @param context - The hook context object.
 * @returns The modified hook context object.
 */
import { HookContext } from "@feathersjs/feathers";
import { Forbidden } from "@feathersjs/errors";
import { has } from 'lodash';

/**
 * Prevents creating a comment on a post route.
 * Throws a Forbidden error if the 'PostId' property is present in the data object.
 *
 * @param context - The hook context.
 * @returns The updated hook context.
 */
export default function noComment(context: HookContext) {
    const { data } = context;
    if (has(data, 'PostId'))
        throw new Forbidden('You cannot create a comment on a post route');
    return context;
}