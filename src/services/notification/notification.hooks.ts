
import { HookContext } from '@feathersjs/feathers';
import { User } from '../../database/user';
import addAssociation from '../../Hooks/AddAssociations';

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
        context.params.userId = context.params.cognitoUser.id;
        return context;
      },
    ],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
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
