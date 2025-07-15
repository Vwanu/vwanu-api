import { Service, SequelizeServiceOptions } from 'feathers-sequelize';

import common from '../../lib/utils/common';
import { Application } from '../../declarations';

const { getUploadedFiles } = common;

export class Posts extends Service {
  app;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async create(data, params) {
    const postData = getUploadedFiles(['postImage', 'postVideo'], data);
    
    const { Media: mediaData, ...postFields } = postData;
    
    // Create the post first
    const post = await this.app
      .service('posts')
      .Model.create(postFields);

    if (mediaData && mediaData.length > 0) {
      const mediaRecords = await this.app
        .get('sequelizeClient')
        .models.Media.bulkCreate(mediaData);
      
      await post.addMedia(mediaRecords);
    }

    const updatedPost = await this.app.service('posts').get(post.id, params);
    return Promise.resolve(updatedPost);
  }
}
