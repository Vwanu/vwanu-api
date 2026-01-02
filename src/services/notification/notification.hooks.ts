
import { HookContext } from '@feathersjs/feathers';
import { User } from '../../database/user';
import addAssociation from '../../Hooks/AddAssociations';
import { LimitToOwner } from '../../Hooks';
import { disallow } from 'feathers-hooks-common';

const addFromUserAssociation = addAssociation({
        models: [
          {
            model: User,
            as: 'fromUser',
            attributes: [
              'firstName',
              'lastName',
              'id',
              'profilePicture',
            ],
          },
        ],
      })

const refetch = async (context : HookContext) : Promise<HookContext> => {
  const notification = await context.app.service('notifications').get(context.result.id, context.params);
    context.result = notification;
 return context;
};
export default {
  before: {
    all:addFromUserAssociation,
    find: [
     (context)=>{
        // Filter notifications to only show those for the logged-in user
        context.params.query = {
          ...context.params.query,
          userId: context.params.cognitoUser.id
        };
        return context;
      },
    ],
    get: disallow(),
    create: [],
    update: disallow(),
    patch: LimitToOwner,
    remove: LimitToOwner,
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: refetch, // check the user setting and determing if text or email should be sent
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
