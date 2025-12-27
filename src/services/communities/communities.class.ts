// import { QueryTypes } from 'sequelize';
import { Id, Params } from '@feathersjs/feathers';
import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';
import { Community } from '../../database/communities';
import { CommunityInterest } from '../../database/junction-tables';


export class Communities extends Service {
  app;

  // eslint-disable-next-line no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  private async createOrUpdateCommunityInterests(data , params:Params,communityid?:Id) {
    const editMode = !!communityid;
    const { interests } = data;

    const community = editMode
    ? await super.patch(communityid as Id, data, { params })
    // @ts-ignore
    : await Community.create(data);

    if(interests && Array.isArray(interests) && interests.length > 0){
        const interestDelta = editMode
        ? await CommunityInterest.getInterestDelta(communityid as Id, interests)
        : interests;

        if(interestDelta && interestDelta.length > 0){
            // @ts-ignore
        await CommunityInterest.bulkCreate(interestDelta.map((interestId) => ({
          communityId: communityid || community.id,interestId,
        }))).catch((err) => {
          console.error('Error creating CommunityInterest records:', err);
        });
        }
    }
    return editMode ? communityid as Id : community.id;
  }
  async create(data, params) {
    const communityId = await this.createOrUpdateCommunityInterests(data, params);
    const newCommunity = await this.app.service('communities').get(communityId, params);
    return Promise.resolve(newCommunity);
  }
  
    async patch(id: Id, data, params) {
      const communityId = await this.createOrUpdateCommunityInterests(data, params, id);
      const updatedCommunity = await this.app.service('communities').get(communityId, params);
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
