// import { QueryTypes } from 'sequelize';
import { Service, SequelizeServiceOptions } from 'feathers-sequelize';

import { Id, Params } from '@feathersjs/feathers';

import common from '../../lib/utils/common';
import { Application } from '../../declarations';
import { Community } from '../../database/communities';

const { getUploadedFiles } = common;



export class Communities extends Service {
  app;

  // eslint-disable-next-line no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async create(data, params) {
    const communityData = getUploadedFiles(['profilePicture', 'coverPicture'], data);
    const { Media: mediaData, } = communityData;

    const { interests, ...otherData } = data;

    const communityFields = {
      ...otherData,
      profilePicture: mediaData?.[0]?.original,
      coverPicture: mediaData?.[0]?.original,
      creatorId: params.User.id
    }

    
    // First create the community without interests
     // @ts-ignore 
    const community = await Community.create(communityFields)

    const sequelize = this.app.get('sequelizeClient');
    const Interest = sequelize.models.Interest;
    
    // Then add interests if they exist
    if (interests && Array.isArray(interests) && interests.length > 0) {
      for (const interestId of interests) {
        const interest = await Interest.findByPk(interestId);
        if (!interest) {
          throw new Error(`Interest not found`);
        }
        await community.addInterest(interest);
      }
    }



    // if (mediaData && mediaData.length > 0) {
    //   const mediaRecords = await this.app
    //     .get('sequelizeClient')
    //     .models.Media.bulkCreate(mediaData);
      
    //   await post.addMedia(mediaRecords);

    // }

    const updatedCommunity = await this.app.service('communities').get(community.id, params);
    return Promise.resolve(updatedCommunity);
  }

  async get(id: Id, params: Params) {
    const sequelize = this.app.get('sequelizeClient');

    let [community] = await sequelize.query(
      'SELECT * FROM fn_get_community_by_id(?,?)',
      {
        replacements: [params.User.id, id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    console.log('community', community);

    community = {
      ...community,
      name: community?.community_name,
      id: community?.comm_id,
      privacyType: community?.commPrivacyType,
      UserId: community?.commUserId,
      interests: community?.Interests,
    };

    delete community.comm_id;
    delete community.community_name;
    delete community.commPrivacyType;
    delete community.commUserId;
    delete community.Interests;

    return Promise.resolve(community);
  }
}
