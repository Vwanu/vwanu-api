import { Service, SequelizeServiceOptions } from 'feathers-sequelize';

import common from '../../lib/utils/common';
import { Application } from '../../declarations';
import { include } from '../../lib/utils/commentPostInclude';


const {getUploadedFiles} = common;


export class Posts extends Service {
  app;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async create(data) {
    const postData = getUploadedFiles(['postImage', 'postVideo'], data);
    const post = await this.app
      .service('posts')
      .Model.create(postData, { include: include(this.app) });

    return Promise.resolve(post);
  }

}
