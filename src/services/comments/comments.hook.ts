import addAssociation from '../../Hooks/AddAssociations';
import { User } from '../../database/user';
import autoOwn from '../../Hooks/AutoOwn';
import LimitToOwner from '../../Hooks/LimitToOwner';

export default {
  before: {
    find: [
      addAssociation({
        models: [
          {
            model: User,
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
            model: User,
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
      autoOwn,
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
        console.log('Notification Hook after create triggered');
        console.log('Context result:>> ', context.result);

        const { userId } = await models.Post.findOne({
          where: { id: context.result.PostId },
        });

        console.log('Creating notification for user:>>??? ', userId);
        await context.app.service('notifications').create({
          userId,
          fromUserId: context.params.User.id, //
          message: 'Commented on your post',
          type: 'direct',
          entityName: 'Post',
          entityId: context.result.PostId,
          notificationType: 'post_comment',
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
