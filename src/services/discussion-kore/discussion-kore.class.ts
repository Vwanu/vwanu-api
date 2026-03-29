import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { BadRequest } from '@feathersjs/errors';
import { Params,Paginated } from '@feathersjs/feathers';

import { Application } from '../../declarations';

export class DiscussionKore extends Service {
  app;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async create(data: any, params: Params ) {
    const { Korem } = this.app.get('sequelizeClient').models;
    const discussionId = data.discussionId;
    try {
    const [result, created] = await Korem.findOrCreate({
      where: {
        UserId: params.cognitoUser.id,
        entityId: discussionId,
        entityType: 'Discussion',
      },
      defaults: {
        entityId: discussionId,
        entityType: 'Discussion',
        UserId: params.cognitoUser.id,
      },
    });
    // If it already existed, remove it (toggle behavior)
    if (!created) {
      await result.destroy();
    }
    return Promise.resolve({ discussionId });
       } catch (error) {
        console.error('Error in DiscussionKore create method:', error);
        throw new BadRequest('An error occurred while toggling Kore for the discussion');
      }
    }


  async find(
    params: Params & { route?: { discussionId: string } },
  ): Promise<Paginated<any>> {
    const { Korem, User } = this.app.get('sequelizeClient').models;
    const {discussionId} = params.query || {};
    console.log('❤️‍🔥❤️‍🔥🆘💔💙[discussionId]', discussionId);
    console.log('❤️‍🔥❤️‍🔥🆘💔💙[params]', params);

    if (!discussionId) {
      throw new BadRequest('Discussion ID is required');
    }


    // Get all users who have kored this discussion
    const korems = await Korem.findAll({
      where: {
        entityId: discussionId,
        entityType: 'Discussion',
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
