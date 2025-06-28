import addAssociation from '../../Hooks/AddAssociations';
import autoOwn from '../../Hooks/AutoOwn';
import LimitToOwner from '../../Hooks/LimitToOwner';

export default {
  before: {
    find: [
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
        ],
      }),
    ],
    get: [
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
        ],
      }),
    ],
    create: [
      (context) => {
        console.log('context in create b4 autoOwn', context.data);
        return context;
      },
      autoOwn,
      (context) => {
        console.log('context in create after autoOwn', context.data);
        return context;
      },
    ],
    update: [LimitToOwner],
    patch: [LimitToOwner],
    remove: [LimitToOwner],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      async (context) => {
        const { models } = context.app.get('sequelizeClient');

        // // eslint-disable-next-line no-underscore-dangle
        const { UserId } = await models.Post.findOne({
          where: { id: context.result.PostId },
        });

        await context.app.service('notification').create({
          UserId: context.params.User.id,
          to: UserId, //
          message: 'Commented on your post',
          type: 'direct',
          entityName: 'posts',
          entityId: context.result.PostId,
          notificationType: 'new_comment',
        });

        return context;
      },
    ],
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
