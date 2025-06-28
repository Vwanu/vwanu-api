import commonHooks from 'feathers-hooks-common';
import { AutoOwn, LimitToOwner, IncludeAssociations } from '../../Hooks';

const UserAttributes = [
  'firstName',
  'lastName',
  'id',
  'profilePicture',
  'createdAt',
];
export default {
  before: {
    all: [
      IncludeAssociations({
        include: [
          {
            model: 'korem',
            as: 'User',
            attributes: UserAttributes,
          },
        ],
      }),
    ],
    find: [],
    get: [],
    create: [AutoOwn],
    update: [commonHooks.disallow('external')],
    patch: [LimitToOwner],
    remove: [LimitToOwner],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      // async (context) => {
      //   const { UserId } = await context.app
      //     .service('posts')
      //     .get(context.result.id);
      //   await context.app.service('notification').create({
      //     UserId: context.params.User.id,
      //     to: UserId, //
      //     message: 'Reacted on your post',
      //     type: 'direct',
      //     entityName: 'posts',
      //     entityId: context.result.id, //
      //   });
      //   return context;
      // },
    ],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [
      async (context) => {
        console.log(`\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>`);
        console.log('context in create', context.error);
        console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n\n`);
        return context;
      },
    ],
    update: [],
    patch: [],
    remove: [],
  },
};
