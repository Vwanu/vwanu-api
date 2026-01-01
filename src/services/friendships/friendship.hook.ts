
import { AddAssociations } from '../../Hooks';
import { User } from '../../database/user';
import AutoAssignHook from '../../Hooks/AutoAssign.hook';
import { disallow } from 'feathers-hooks-common';
// import { HookContext } from '@feathersjs/feathers';
// import { FriendshipStatus } from '../../types/enums';

const AddTargetUser = AddAssociations({
  models: [
    {
      model: User,
      as: 'target',
      attributes: ['id', 'firstName', 'lastName', 'profilePicture'],
    },
    {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'profilePicture'],
    }
  ],
});

// const NotifiyRequesterIfAccepted= async (context: HookContext): Promise<HookContext> =>{
//     console.log('NotifiyRequesterIfAccepted hook triggered');
//     console.log({result:context.result, params:context.params});
//     if(!context.result || context.result.status !== FriendshipStatus.ACCEPTED) return context;
//     await context.app.service('notifications').create({
//       fromUserId: context.params.User.id,
//       userId: context.result.userId, // the notification goes to the requester
//       message: 'Accepted your friend request',
//       type: 'direct',
//       entityName: 'Friendship',
//       entityId: context.result.id,
//       notificationType: 'friend_accept',
//     });

//     return context;
// }

export default {
  before: {
    all: AddTargetUser,
    update: disallow(),
    create: AutoAssignHook({userId:null}),
  },
  after: {
//    patch:NotifiyRequesterIfAccepted,
  },
};
