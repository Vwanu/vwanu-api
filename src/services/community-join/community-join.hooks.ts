import { disallow } from 'feathers-hooks-common';

// import validateResource from '../../middleware/validateResource';
// import createCommunityJoinSchema from '../../schema/community-join';
import AutoOwn from '../../Hooks/AutoOwn';
import NestedPath from '../../Hooks/NestedPath';
import AutoAssignHook from '../../Hooks/AutoAssign.hook';
import QueryTodata from '../../Hooks/QueryTodata';
// import { HookContext } from '@feathersjs/feathers';
import  {AddAssociations}  from '../../Hooks';
import { User } from '../../database/user';
import { CommunityRole } from '../../database/communityRole.model';
// const MemberRoleAssign = () => {
//   return async (context: HookContext): Promise<HookContext> => {
//     try {
//     const roleId = await context.app.service('community-roles').find({
//       query: {
//         name: 'member',
//         $limit:1
//       },
//       User: context.params.User
//     })

//     context.data.communityRoleId = roleId.data[0].id;
//       } catch (error) {
//         console.error('Error assigning member role:', error);

//     }
//     return context;
//   };
// }

const attributes = [
  'firstName',
  'lastName',
  'id',
  'profilePicture',
  'createdAt',
];

export default {
  before: {
    all:AddAssociations({
      models: [
        {
          model: User,
          as: 'guest',
          attributes,
        },

        {
          model: User,
          as: 'approver',
          attributes,
        },
        {
          model: CommunityRole,
          as: 'communityRole',
        },
      ],
    }),
    get: disallow(),
    create: [ NestedPath, AutoOwn, AutoAssignHook({guestId:null}),QueryTodata],
    update: disallow(),
    patch: disallow(),
    remove: disallow(),
  },

  after: {
    create: [],
  },
};
