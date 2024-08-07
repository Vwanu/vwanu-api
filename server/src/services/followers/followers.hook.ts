/* eslint-disable camelcase */
import * as feathersAuthentication from '@feathersjs/authentication';
import { disallow } from 'feathers-hooks-common';
import getFollower from './hooks/getFollower';
import AgeAllow from '../../Hooks/AgeAllow';

const { authenticate } = feathersAuthentication.hooks;
const notAllowed = disallow();
export default {
  before: {
    all: [authenticate('jwt'), AgeAllow],
    get: notAllowed,
    update: notAllowed,
    patch: notAllowed,
    find: [getFollower],
    create: [
      async (context) => {
        context.service.options.Model =
          context.app.get('sequelizeClient').models.Followers;
        context.data.follower_id = context.params.User.id;
        context.data.user_id = context.data.UserId;
        delete context.data.UserId;
        return context;
      },
    ],
    remove: [
      // async (context: HookContext) => {
      //   const user_id = context.id;
      //   delete context.id;

      //   context.params.sequelize = {
      //     logging: console.log,
      //     where: {
      //       user_id,
      //       follower_id: context.params.User.id,
      //     },
      //   };

      //   return context;
      // },
    ],
  },
  // Might want to notify the user when someone follows or unFollow them
  after: {
    create: [],
    remove: [],
  },
};


