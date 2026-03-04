import { AddAssociations } from '../../Hooks';
import commonHooks from 'feathers-hooks-common';
import saveProfilePicture from '../../Hooks/SaveProfilePictures.hooks';

/** Local dependencies  */
import {
  AutoOwn,
  LimitToOwner,
  SaveInterest,
//   ValidateResource,
} from '../../Hooks';
import { User } from '../../database/user';
import { Interest } from '../../database/interest';

// import QueryBlogs from './hooks/findBlog';

// import * as Schema from '../../schema/blog.schema';
import setPublishedAt from './hooks/setPublishedAt.hook';

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

const AddInterests = AddAssociations({
  models: [
    {
      model: Interest,
      as: 'interests',
    },
  ],
});
export default {
  before: {
    all: [AddAutor],
    find: [AddInterests],
    get: [AddInterests],
    create: [
      setPublishedAt,
    //   ValidateResource(Schema.createBlogSchema),
      AutoOwn,
      saveProfilePicture(['titlePicture'],'blog'),
      (context) => {
        context.params._interests = context.data.interests;
        delete context.data.interests;
        return context;
      },
    ],
    update: [commonHooks.disallow('external')],
    patch: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        commonHooks.preventChanges(true, ...['slug', 'id'])
      ),
      setPublishedAt,
      LimitToOwner,
     saveProfilePicture(['titlePicture']),
    ],
    remove: [LimitToOwner],
  },

  after: {
    all: [],
    find: [(c)=>{
        console.log('🆘❤️‍🔥🆘❤️‍🔥🆘❤️‍🔥🆘❤️‍🔥🆘❤️‍🔥🆘❤️‍🔥🆘❤️‍🔥🆘❤️‍🔥🆘❤️‍🔥after find')
        console.log(c.result)
        return c;}],
    get: [(c)=>{
        console.log('🆘❤️‍🔥🆘❤️‍🔥🆘❤️‍🔥🆘❤️‍🔥🆘❤️‍🔥🆘❤️‍🔥🆘❤️‍🔥🆘❤️‍🔥🆘❤️‍🔥after find')
        console.log(c.result)
        return c;}],
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
