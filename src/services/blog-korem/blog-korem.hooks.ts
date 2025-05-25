import commonHooks from 'feathers-hooks-common';

// Don't remove this comment. It's needed to format import lines nicely.
import {
  AutoOwn,
  LimitToOwner,
  AddAssociations,
  AdjustCount,
  ServiceAssign,
} from '../../Hooks';

// ValidateResource

const UserAttributes = [
  'firstName',
  'lastName',
  'id',
  'profilePicture',
  'createdAt',
];

const AdjustCountOptions = {
  model: 'Blog',
  field: 'amountOfLikes',
  key: 'entityId',
};
const AssociateUserAndAdjustCount = async (context) => {
  const { app } = context;
  const { UserId, entityId, createdAt, created } = context.result;

  const User = await app
    .service('users')
    .get(UserId, { query: { $select: UserAttributes } });

  context.result = { User, entityId, createdAt, created };
  if (created) return AdjustCount(AdjustCountOptions)(context);

  await app
    .get('sequelizeClient')
    .models.Blog.decrement({ amountOfLikes: 1 }, { where: { id: entityId } });

  return context;
};

export default {
  before: {
    all: [
      AddAssociations({
        models: [
          {
            model: 'users',
            attributes: UserAttributes,
          },
        ],
      }),
    ],
    find: [],
    get: [],
    create: [AutoOwn, ServiceAssign({ name: 'Blog' })],
    update: [commonHooks.disallow('external')],
    patch: [commonHooks.disallow('external')],
    remove: [LimitToOwner],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [AssociateUserAndAdjustCount],
    update: [],
    patch: [],
    remove: [AdjustCount(AdjustCountOptions)],
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
