import { HookContext } from '@feathersjs/feathers';
import { Op } from '@sequelize/core';
import userQuery from '../../../lib/utils/userQuery';

export default (context: HookContext): HookContext => {
  const { app, params } = context;
  const { query: where } = context.app
    .service(context.path)
    .filterQuery(context.params);
  const Sequelize = app.get('sequelizeClient');
  const { UserId } = where;
  delete where.UserId;
  const friends = `(
    EXISTS(
    SELECT 1
    FROM friends
    WHERE (friends.user_one_id='${UserId || params.User.id}' AND friends.user_two_id="User"."id")
    OR (friends.user_two_id='${UserId || params.User.id}' AND friends.user_one_id="User"."id")
  ))`;

  const clause = {
    ...where,
    [Op.and]: [Sequelize.where(Sequelize.literal(friends), true)],
  };
  params.sequelize = {
    where: clause,
    logging: console.log,

    attributes: ['firstName', 'lastName', 'id', 'profilePicture', 'createdAt', 'updatedAt']


    // [
    //   'firstName',
    //   'lastName',
    //   'email',
    //   'id',
    //   'profilePicture',
    //   'createdAt',
    //   'updatedAt',
    // ],

    // attributes: {
    //   include: [[Sequelize.literal(friends), 'User']],
    // },
  };

  return context;
};
