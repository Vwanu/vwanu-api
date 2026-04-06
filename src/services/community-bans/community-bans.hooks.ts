// import { HookContext } from '@feathersjs/feathers';
import { disallow } from 'feathers-hooks-common';
// import { Forbidden, BadRequest } from '@feathersjs/errors';

import * as schema from '../../schema/bans';
import validateResource from '../../Hooks/validateResource';
import NestedPath from '../../Hooks/NestedPath';
import AutoAssignHook from '../../Hooks/AutoAssign.hook';
import { HookContext } from '@feathersjs/feathers';
import { AddAssociations } from '../../Hooks';
import { User } from '../../database/user';

const attributes = [
  'firstName',
  'lastName',
  'id',
  'profilePicture',
  'createdAt',
];

/**
 * Hook to verify the requesting user is an admin or moderator of the community.
 */
// const isAdminOrModerator = async (context: HookContext): Promise<HookContext> => {
//   const communityId = context.data?.communityId || context.params.query?.communityId;
//   const userId = context.params.User?.id;

//   if (!communityId || !userId) {
//     throw new BadRequest('Missing communityId or user authentication');
//   }

//   const sequelize = context.app.get('sequelizeClient');
//   const { CommunityUsers, CommunityRoles } = sequelize.models;

//   const membership = await CommunityUsers.findOne({
//     where: {
//       communityId,
//       userId,
//     },
//     include: [{ model: CommunityRoles, as: 'communityRole' }],
//   });

//   if (!membership || !membership.communityRole) {
//     throw new Forbidden('You are not a member of this community');
//   }

//   const roleName = membership.communityRole.name;
//   if (roleName !== 'admin' && roleName !== 'moderator') {
//     throw new Forbidden('Only admins and moderators can manage bans');
//   }

//   return context;
// };

const banDurationStringToDate = (context: HookContext): HookContext => {
    console.log('❤️‍🔥Context data before processing duration:', context.data);
  const duration = context.data?.until;
  //  duration is like 1-week or 3-days, we need to convert it to a date

  if (duration && typeof duration === 'string') {
    const [value, unit] = duration.split('_');
    const now = new Date();
    switch (unit) {
      case 'week':
      case 'weeks':
        now.setDate(now.getDate() + parseInt(value) * 7);
        break;
      case 'day':
      case 'days':
        now.setDate(now.getDate() + parseInt(value));
        break;
      case 'hour':
      case 'hours':
        now.setHours(now.getHours() + parseInt(value));
        break;
      case 'minute':
      case 'minutes':
        now.setMinutes(now.getMinutes() + parseInt(value));
        break;
      default:
        throw new Error(`Invalid duration unit: ${unit}`);
    }
    context.data.until = now;
  }
  return context;
};

const contextQueryToData = (context: HookContext): HookContext => {
  if (context.params.query) {
    context.data = {
      ...context.data,
      ...context.params.query,
    };
  }
  return context;
}

export default {
  before: {
    find: [
      NestedPath,
      contextQueryToData,
      AddAssociations({
        models: [
          { model: User, as: 'bannedUser', attributes },
          { model: User, as: 'bannedByUser', attributes },
        ],
      }),
    //   isAdminOrModerator,
    ],
    get: disallow(),
    create: [NestedPath, AutoAssignHook({byUserId:null}), contextQueryToData, banDurationStringToDate, validateResource(schema.createBanSchema)],
    update: disallow(),
    patch: disallow(),
    remove: [/* NestedPath */],
  },

  after: {
    all: [],
    find: [],
    create: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    create: [],
    remove: [],
  },
};
