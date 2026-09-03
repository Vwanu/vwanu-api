import addAssociation from '../../Hooks/AddAssociations';
import { User } from '../../database/user';
import autoOwn from '../../Hooks/AutoOwn';
import LimitToOwner from '../../Hooks/LimitToOwner';
import { NotificationSlug } from '../../types/notifications';
import { NotificationService } from '../notifications/NotificationService';
import { EntityType } from '../../types/enums';

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
        const { userId } = await models.Post.findOne({
          where: { id: context.result.PostId },
        });

        await NotificationService.create(context.app, {
          userId,
          fromUserId: context.params.User.id,
          slug: NotificationSlug.NEW_COMMENT,
          message: 'Commented on your post',
          type: 'direct',
          entityName: EntityType.POST,
          entityId: context.result.PostId,
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
