import {
  AutoOwn,
  AgeAllow,
  LimitToOwner,
  IncludeAssociations,
  AdjustCount,
} from '../../Hooks';
import { requireAuth } from '../../Hooks/requireAuth';


const AdjustCountOptions = {
  model: 'Blog',
  field: 'amountOfComments',
  key: 'BlogId',
};
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
      requireAuth,
      AgeAllow,
      IncludeAssociations({
        include: [
          {
            model: 'blogResponse',
            as: 'User',
            attributes: UserAttributes,
          },
        ],
      }),
    ],
    find: [],
    get: [],
    create: [AutoOwn],
    update: [],
    patch: [LimitToOwner],
    remove: [LimitToOwner],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [AdjustCount(AdjustCountOptions)],
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
