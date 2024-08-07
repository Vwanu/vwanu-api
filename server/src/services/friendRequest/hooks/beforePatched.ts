
import { HookContext } from '@feathersjs/feathers';
import { Op } from 'sequelize';

export default function (context: HookContext): HookContext {
    const { data, params } = context;
    params.sequelize = {
        // logging: console.log,
        where: {
            [Op.and]: [
                { requester_id: data.friendId },
                { receiver_id: params.User.id }
            ]
        }
    };
    // data.requester_id = data.friendId;
    // data.receiver_id = context.params.User.id;
    data.response_date = Date.now();
    delete data.friendId;
    return context;
}