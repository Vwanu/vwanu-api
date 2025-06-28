import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { BadRequest } from '@feathersjs/errors';
import { Params, Paginated } from '@feathersjs/feathers';

import { Application } from '../../declarations';

export class PostKore extends Service {
  app;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async create(data: any, params: Params & { route?: { postId: string } }) {
    const { Korem } = this.app.get('sequelizeClient').models;
    const postId = params.route?.postId;

    if (!postId) {
      throw new BadRequest('Post ID is required');
    }

    // Check if post exists
    let post;
    try {
      post = await this.app.service('posts').get(postId, params);
    } catch (e) {
      console.log('[PostKore] Error getting post', e);
      throw new BadRequest(`No post found with id ${postId}`);
    }

    if (!post) {
      throw new BadRequest(`No post found with id ${postId}`);
    }

    // Find or create a korem for this post
    const [result, created] = await Korem.findOrCreate({
      where: {
        UserId: params.cognitoUser.id,
        entityId: postId,
        entityType: 'Post',
      },
      defaults: {
        entityId: postId,
        entityType: 'Post',
        UserId: params.cognitoUser.id,
      },
    });

    // If it already existed, remove it (toggle behavior)
    if (!created) {
      await result.destroy();
    }

    // Return the updated post
    return this.app.service('posts').get(postId, params);
  }

  async find(
    params: Params & { route?: { postId: string } },
  ): Promise<Paginated<any>> {
    const { Korem, User } = this.app.get('sequelizeClient').models;
    const postId = params.route?.postId;
    console.log('postId', postId);

    if (!postId) {
      throw new BadRequest('Post ID is required');
    }

    // Check if post exists
    try {
      await this.app.service('posts').get(postId, params);
    } catch (e) {
      throw new BadRequest(`No post found with id ${postId}`);
    }

    // Get all users who have kored this post
    const korems = await Korem.findAll({
      where: {
        entityId: postId,
        entityType: 'Post',
      },
      include: [
        {
          model: User,
          attributes: [
            'id',
            'firstName',
            'lastName',
            'email',
            'profilePicture',
          ],
        },
      ],
    });

    return {
      total: korems.length,
      limit: 0,
      skip: 0,
      data: korems,
    };
  }
}
