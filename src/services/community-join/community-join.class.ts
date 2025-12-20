import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { NotFound, BadRequest } from '@feathersjs/errors';

import { Application } from '../../declarations';
import {Params} from '@feathersjs/feathers';

interface Data {
    guestId: string,
    communityId: string,
    userId: string,
    isAutoApproved: boolean,
    approverId?: string| null,
    communityRoleId?: string
    user_id?: string
}
export class CommunityJoinRequest extends Service {
  app: Application;
  // eslint-disable-next-line no-unused-vars

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }


  async create(data: Data, params: Params): Promise<any> {
    const seq = this.app.get('sequelizeClient');

    // @ts-ignore
    const { Community, /*CommunityBans,*/ CommunityUsers, CommunityInvitationRequest, CommunityRoles} = seq.models;
    const community = await Community.findByPk(data.communityId);

    console.log({
        Community, /*CommunityBans*/ CommunityUsers, CommunityInvitationRequest, CommunityRoles
    })

    if (!community) {
      throw new NotFound('Community not found');
    }

   // IF COMMUNITY IS HIDDEN DOES NOT ALLOW JOIN REQUESTS
    if (community.privacyType === 'hidden') {
      throw new BadRequest('Cannot send join request to a hidden community');
    }

    // CHECK IF USER HAS BEEN BANNED FROM THE COMMUNITY
    // const banRecord = await CommunityBans.findOne({
    //   where: {
    //     communityId: data.communityId,
    //     userId: data.userId,
    //   },
    // });

    // if (banRecord) {
    //   throw new BadRequest('You have been banned from this community');
    // }
    // CHECK IF THERE IS AN EXISTING MEMBER
    const existingMember = await CommunityUsers.findOne({
      where: {
        communityId: data.communityId,
        userId: data.userId,
      },
    });

    if (existingMember) {
      throw new BadRequest('You are already a member of this community');
    }

    // CHECK FOR PENDING INVITATION
    const existingInvitation = await CommunityInvitationRequest.findOne({
      where: {
        communityId: data.communityId,
        guestId: data.userId,
      },
    });

    if (existingInvitation) {
        // Auto-accept the invitation
        if(existingInvitation.isPending()){
            existingInvitation.accept();
            await Promise.all([
            CommunityUsers.create({communityId: data.communityId,userId: data.userId,communityRoleId: existingInvitation.communityRoleId}),
            existingInvitation.save()]);
        return {message: 'You have been added to the community via invitation.'};
        }

        else if(existingInvitation.isAccepted()){

await CommunityUsers.create({communityId: data.communityId,userId: data.userId,communityRoleId: existingInvitation.communityRoleId});
return {message: 'You have been added to the community via invitation.'};


    }}

    // CHECK IF THE COMMUNIT IS PRIVATE OR PUBLIC AND AUTO APPROVE IF PUBLIC
    if (community.privacyType === 'public') {
      data.isAutoApproved = true;
      data.approverId = null; // No approver for auto-approved requests
    } else {
      data.isAutoApproved = false;
    }

    // Add with Member Role by Default
    const memberRoleId = await CommunityRoles.findOne({
      where: {
        name: 'member',
      },
    });
    data.communityRoleId = memberRoleId.id;

    if(data.isAutoApproved){
    await CommunityUsers.create({communityId: data.communityId,userId: data.userId,communityRoleId: data.communityRoleId})
}
   const existingJoinRequest = await super.find({
      query: {
        guestId: data.guestId,
        communityId: data.communityId,
        $limit: 1
      },
      ...params
    });

    if (existingJoinRequest['total'] > 0) {
      throw new BadRequest('You have already requested to join this community');
    }
    return super.create(data, params);
  }
}
