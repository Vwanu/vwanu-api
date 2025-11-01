import { HookContext } from '@feathersjs/feathers';
import addAssociation from '../../Hooks/AddAssociations';
import OwnerOrAuthorized from './hooks/OwnerOrAuthorized';
import NestedPath from '../../Hooks/NestedPath';




export default {
  before: {
 
    find: [
      NestedPath,
      addAssociation({
        models: [
          {
            model: 'users',
            attributes: [
              'firstName',
              'lastName',
              'id',
              'profilePicture',
              'createdAt',
            ],
          },
          {
            model: 'community-role',
            attributes: ['name', 'id'],
          },
        ],
      }),
    ],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [OwnerOrAuthorized],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
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
