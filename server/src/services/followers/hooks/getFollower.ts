import { HookContext } from '@feathersjs/feathers';
import { BadRequest } from '@feathersjs/errors';
import { Op } from '@sequelize/core';


export default (context: HookContext): HookContext => {
  const { app, params } = context;
  const { query: where } = context.app
    .service(context.path)
    .filterQuery(context.params);
  const Sequelize = app.get('sequelizeClient');
  context.service.options.Model = Sequelize.models.User;

  const { action, UserId } = where;
  delete where.action;
  delete where.UserId;

  const follower = `EXISTS(SELECT 1 FROM followers WHERE followers.user_id='${UserId || params.User.id}' AND followers.follower_id="User"."id")`;

  const following = `EXISTS(SELECT 1 FROM followers WHERE followers.user_id="User".id AND followers.follower_id='${UserId || params.User.id}')`;

  const clause = {

    ...where,
    [Op.and]: [],
  };
  switch (action) {
    case 'people-who-follow-me':
      // clause[Op.and].push(Sequelize.where(Sequelize.literal(following), true));
      clause[Op.and].push(Sequelize.where(Sequelize.literal(follower)));
      break;
    case 'people-i-follow':
      clause[Op.and].push(Sequelize.where(Sequelize.literal(following), true));
      break;
    default:
      throw new BadRequest('This action is not supported');
  }


  params.sequelize = {
    // logging: console.log,
    where: clause,
    attributes: [
      'firstName',
      'lastName',
      'email',
      'id',
      'profilePicture',
    ],


  };

  return context;
};
