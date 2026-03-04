import { AddAssociations } from '../../Hooks';
import commonHooks from 'feathers-hooks-common';
import saveProfilePicture from '../../Hooks/SaveProfilePictures.hooks';

/** Local dependencies  */
import {
  AutoOwn,
  LimitToOwner,
  SaveInterest,
  ValidateResource,
  TrueBoolean,
} from '../../Hooks';
import { User } from '../../database/user';

// import QueryBlogs from './hooks/findBlog';

import * as Schema from '../../schema/blog.schema';

const UserAttributes = [
  'firstName',
  'lastName',
  'id',
  'profilePicture',
  'createdAt',
];



const AddAutor = AddAssociations({
  models: [
    {
      model: User,
      as: 'user',
      attributes: UserAttributes,
    },
  ],
});
export default {
  before: {
    all: AddAutor,
    // find: [QueryBlogs],
    // get: [QueryBlogs],
    create: [
      TrueBoolean(['publish']),
      ValidateResource(Schema.createBlogSchema),
      AutoOwn,
      saveProfilePicture(['titlePicture'],'blog'),
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
     saveProfilePicture(['titlePicture']),
    ],
    remove: [LimitToOwner],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
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
