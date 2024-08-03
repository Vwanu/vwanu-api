/**
 * This file contains the implementation of the `querryFriendRequest` hook.
 * The hook is responsible for validating and modifying the data and params objects in the hook context.
 * It checks if the required fields `action`, `receiver_id`, and `requester_id` are present in the `data` object.
 * If any of these fields are missing or if there are conflicting fields present, it throws a BadRequest error.
 * If the `action` field is present, it performs specific actions based on its value.
 * - If the `action` is 'people-i-want-to-be-friend-with', it deletes the `action` field, sets the `receiver_id` to the provided value, and sets the `requester_id` to the `User.id` from the `params` object.
 * - If the `action` is 'people-who-want-to-Be-my-friend', it deletes the `action` field, sets the `receiver_id` to the `User.id` from the `params` object, and sets the `requester_id` to the provided value.
 * If the `action` is not supported, it throws a BadRequest error.
 * Finally, it returns the modified hook context.
 */
/* eslint-disable camelcase */
import { HookContext } from '@feathersjs/feathers';
import { BadRequest } from '@feathersjs/errors';



export default (context: HookContext): HookContext => {

  const { params } = context;

  console.log('queryFriendRequest.ts', params.query);
  const { receiver_id, requester_id, action } = params.query;
  if (
    (!action || !receiver_id || !requester_id) &&
    (action && receiver_id) &&
    (action && requester_id) &&
    (receiver_id && requester_id)
  ) {
    throw new BadRequest('Please set an action, or receiver_id or requester_id');
  }

  if (action) {

    switch (action) {
      case 'people-i-want-to-be-friend-with':
        delete params.query.action;
        params.query.requester_id = params.User.id;
        break;
      case 'people-who-want-to-Be-my-friend':
        delete params.query.action;
        params.query.receiver_id = params.User.id;
        break;
      default:
        throw new BadRequest('This action is not supported');
    }
  }
  return context;
};








// deprecated code
// import { Op } from '@sequelize/core';

// const userAttributes = ['firstName', 'lastName', 'id', 'profilePicture'];

// export default (context: HookContext): HookContext => {
//   const { app, params } = context;
//   if (!params.provider) return context;
//   const { query: where } = context.app
//     .service(context.path)
//     .filterQuery(context.params);
//   const Sequelize = app.get('sequelizeClient');
//   context.service.options.Model = Sequelize.models.User;

//   const { action, UserId } = where;
//   if (!action) throw new BadRequest('Please set an action');
//   delete where.action;
//   delete where.UserId;
//   const peopleWhoWantToBeMyFriend = `(

//       EXISTS (
//         SELECT 1
//       FROM "User_friends_request" AS "UFR"
//       WHERE "UFR"."friendsRequestId"='${
//         UserId || params.User.id
//       }' AND "UFR"."UserId"="User"."id"
//     ))`;

//   const peopleIWantToBe = `(

//       EXISTS (
//         SELECT 1
//       FROM "User_friends_request" AS "UFR"
//       WHERE "UFR"."UserId"='${
//         UserId || params.User.id
//       }' AND "UFR"."friendsRequestId"="User"."id"
//     ))`;

//   const clause = {
//     ...where,
//     [Op.and]: [],
//   };

//   switch (action) {
//     case 'people-i-want-to-be-friend-with':
//       clause[Op.and].push(
//         Sequelize.where(Sequelize.literal(peopleWhoWantToBeMyFriend), true)
//       );
//       break;

//     // case 'people-i-want-to-be-friend-with':
//     case 'people-who-want-to-Be-my-friend':
//       clause[Op.and].push(
//         Sequelize.where(Sequelize.literal(peopleIWantToBe), true)
//       );
//       break;
//     default:
//       throw new Error('This action is not supported');
//   }

//   params.sequelize = {
//     where: clause,
//     attributes: userAttributes,
//   };

//   return context;
// };
