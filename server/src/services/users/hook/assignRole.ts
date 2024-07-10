/* eslint-disable no-underscore-dangle */
import { HookContext } from '@feathersjs/feathers';

export default (role: string = 'member') => async (context: HookContext): Promise<HookContext> => {
    try {
        const memBerRole = await context
            .app.service('community-role')
            ._find({
                query: { name: role, $select: ['id'], $limit: 1 }
            },
                { paginate: false });


        context.data.access_role_id = memBerRole.data[0].id;
    } catch (error) {
        throw new Error(error);
    }

    return context;
}