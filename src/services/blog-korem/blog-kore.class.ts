import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { BadRequest } from '@feathersjs/errors';
import { Params, Paginated } from '@feathersjs/feathers';

import { Application } from '../../declarations';

export class BlogKore extends Service {
  app;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async create(data: any, params: Params & { route?: { postId: string } }) {
    const { Korem } = this.app.get('sequelizeClient').models;
    const BlogId = params.route?.blogId;

    console.log('BlogId', BlogId);
    if (!BlogId) {
      throw new BadRequest('Blog ID is required');
    }

    await this.app
      .service('blogs')
      .get(BlogId, params)
      .catch(() => {
        throw new BadRequest('No blog found with id');
      });

    // Find or create a korem for this post
    const [result, created] = await Korem.findOrCreate({
      where: {
        UserId: params.cognitoUser.id,
        entityId: BlogId,
        entityType: 'Blog',
      },
      defaults: {
        entityId: BlogId,
        entityType: 'Blog',
        UserId: params.cognitoUser.id,
      },
    });

    // If it already existed, remove it (toggle behavior)
    if (!created) {
      await result.destroy();
    }

    // Return the updated post
    return this.app.service('blogs').get(BlogId, params);
  }

  async find(
    params: Params & { route?: { postId: string } },
  ): Promise<Paginated<any>> {
    const { Korem, User } = this.app.get('sequelizeClient').models;
    const blogId = params.route?.blogId;
    console.log('blogId', blogId);

    if (!blogId) {
      throw new BadRequest('Blog ID is required');
    }

    // Check if post exists
    try {
      await this.app.service('blogs').get(blogId, params);
    } catch (e) {
      throw new BadRequest(`No blog found with id ${blogId}`);
    }

    // Get all users who have kored this post
    const korems = await Korem.findAll({
      where: {
        entityId: blogId,
        entityType: 'Blog',
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
