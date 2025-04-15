import commonHooks from 'feathers-hooks-common';
import saveProfilePicture from '../../Hooks/SaveProfilePictures.hooks';
import { requireAuth } from '../../Hooks/requireAuth';
/** Local dependencies  */
import {
  AutoOwn,
  AgeAllow,
  LimitToOwner,
  SaveInterest,
  ValidateResource,
  TrueBoolean,
  IncludeAssociations,
} from '../../Hooks';

import QueryBlogs from './hooks/findBlog';

import * as Schema from '../../schema/blog.schema';

const UserAttributes = [
  'firstName',
  'lastName',
  'id',
  'profilePicture',
  'createdAt',
];
const SaveCover = saveProfilePicture(['coverPicture']);
export default {
  before: {
    all: [
      requireAuth,
      AgeAllow,
      IncludeAssociations({
        include: [
          {
            model: 'blogs',
            as: 'User',
            attributes: UserAttributes,
          },
          { model: 'blogs', as: 'Interests' },
        ],
      }),
    ],
    find: [QueryBlogs],
    get: [QueryBlogs],
    create: [
      TrueBoolean(['publish']),
      ValidateResource(Schema.createBlogSchema),
      AutoOwn,
      SaveCover,
    ],
    update: [commonHooks.disallow('external')],
    patch: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        commonHooks.preventChanges(true, ...['slug', 'id'])
      ),
      TrueBoolean(['publish']),
      ValidateResource(Schema.editBlogSchema),
      LimitToOwner,
      SaveCover,
    ],
    remove: [LimitToOwner],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [SaveInterest],
    update: [],
    patch: [SaveInterest],
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
