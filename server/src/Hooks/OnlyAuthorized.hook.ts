/**
 * A hook that filters the query based on the owner column and the current user's ID.
 * @param ownerColumn The name of the owner column in the database table.
 * @returns The modified hook context.
 */
import { HookContext } from "@feathersjs/feathers";

export default (onwerColumn: string) => (context: HookContext): HookContext => {

    const { query: where } = context
        .app
        .service(context.path)
        .filterQuery(context.params);

    context.params.sequelize = {
        where: {
            ...where,
            [onwerColumn]: context.params.user.id
        }
    };

    return context;
}