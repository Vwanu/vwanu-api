/* eslint-disable no-unused-vars */
import { Params } from '@feathersjs/feathers';
import { Service, SequelizeServiceOptions } from 'feathers-sequelize';

import { BadRequest, GeneralError } from '@feathersjs/errors';
import { Application } from '../../declarations';
// import common from '../../lib/utils/common';

// const { getUploadedFiles } = common;

// eslint-disable-next-line import/prefer-default-export
export class Comments extends Service {
  app: Application;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async create(data, params: Params) {
    try {
      const postId = data.postId;

      if (!postId) throw new BadRequest('PostId is required');

      const db = this.app.get('sequelizeClient').models;
      const post = await db.Post.findByPk(postId);
      if (!post) throw new BadRequest(`No post found with id ${postId}`);

      return this.app
        .service('posts')
        .create(
          { ...data, UserId: params.cognitoUser.id, PostId: postId },
          params,
        );
    } catch (error: unknown | any) {
      throw new GeneralError(error);
    }
  }
}
