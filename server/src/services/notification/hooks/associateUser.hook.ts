
import { HookContext } from '@feathersjs/feathers';
import addAssociation from '../../../Hooks/AddAssociations';
import userBasicAttributes from '../../../lib/utils/userBasicAttributes';

/**
 * Associates user information with the provided context.
 * @param context The HookContext object containing the context information.
 * @returns The modified HookContext object with the associated user information.
 */
export default (context: HookContext): HookContext =>

    addAssociation({
        models: [
            {
                model: 'users',
                attributes: userBasicAttributes,
            },
        ],
    })(context);
