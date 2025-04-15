import { requireAuth } from '../../Hooks/requireAuth';
import { disallow } from 'feathers-hooks-common';
import getFollower from './hooks/getFollower';
import AgeAllow from '../../Hooks/AgeAllow';


const notAllowed = disallow();
export default {
  before: {
    all: [requireAuth, AgeAllow],
    get: notAllowed,
    update: notAllowed,
    patch: notAllowed,
    find: [getFollower],
    create: [
      async (context) => {
        context.service.options.Model =
          context.app.get('sequelizeClient').models.User_Follower;
        context.data.FollowerId = context.params.User.id;
        return context;
      },
    ],
  },
  // Might want to notify the user when someone follows or unFollow them
  after: {
    create: [],
    remove: [],
  },
};
