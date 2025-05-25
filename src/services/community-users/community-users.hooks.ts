import addAssociation from '../../Hooks/AddAssociations';

import OwnerOrAuthorized from './hooks/OwnerOrAuthorized';



export default {
  before: {
 
    find: [
      (context) => {
        context.params.query = {
          ...context.params.query,
        };
      },
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
