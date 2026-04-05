import { Params, Id } from '@feathersjs/feathers';
import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { BadRequest, GeneralError } from '@feathersjs/errors';
import { Application } from '../../declarations';

export class Followers extends Service {
  app;

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  /**
   * Follow a user
   * Creates a follower record: the signed-in user follows the target user (data.UserId)
   */
  async create(data: any, params: Params) {
    const { UserFollower } = this.app.get('sequelizeClient').models;

    const followerId = params.User.id;
    const userId = data.UserId;

    if (followerId === userId) {
      throw new BadRequest('You cannot follow yourself');
    }

    try {
      await UserFollower.create({
        userId,
        followerId,
      });
      return { message: 'Followed successfully' };
    } catch (err: unknown | any) {
      if (err.name?.includes('SequelizeUniqueConstraintError')) {
        throw new BadRequest('Already following this user');
      }
      throw new GeneralError('Could not follow user');
    }
  }

  /**
   * Unfollow a user
   * @param id - The id of the user to unfollow
   */
  async remove(id: Id, params: Params) {
    const { UserFollower } = this.app.get('sequelizeClient').models;

    try {
      const res = await UserFollower.destroy({
        where: { userId: id, followerId: params.User.id },
      });
      if (res === 0) {
        throw new BadRequest('You are not following this user');
      }
      return { message: 'Unfollowed successfully' };
    } catch (error: unknown | any) {
      if (error.type === 'FeathersError') throw error;
      throw new GeneralError('Could not unfollow');
    }
  }
}
