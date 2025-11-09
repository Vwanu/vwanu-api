import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';
import { BadRequest } from '@feathersjs/errors';
import type { Community } from '@root/database/communities';
import type { CommunityUser } from '@root/database/community-users';
// @ts-ignore
import { Op } from 'sequelize';

// eslint-disable-next-line import/prefer-default-export
export class CommunityInvitationRequest extends Service {
  app;

  // eslint-disable-next-line no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async create(data: any, params?: any): Promise<any> {
    const { userIds, hostId } = data;
    const { models } = this.app.get('sequelizeClient');

    // Use models from sequelize with type assertion for type safety
    const community = await models
    .Community
    .findByPk(params.route.communityId, {
      include: [
        { model: models.CommunityUsers, as: 'members' },
      ],
    }) as Community | null;

    if (!community)
      throw new BadRequest('Community not found');

    if (userIds.includes(community.creatorId))
      throw new BadRequest('Community\'s creator cannot be sent invitation to join their own community');

    if(community.members?.some((member: CommunityUser) => userIds.includes(member.userId))){ 
        throw new BadRequest('Some users are already members of this community');
    }

    const existingInvitations = await models.CommunityInvitationRequest.findAll({
      where: {
        hostId,
        guestId: { [Op.in]: userIds },
        communityId: params.route.communityId,
        response: null,
      },
    });

    if (existingInvitations.length > 0)
      throw new BadRequest('Some users already have an invitation for this community');
    
    console.log('Creating invitations for users:', userIds);
    // Prepare invitations to create
    const invitationsToCreate = userIds.map((guestId: string) => ({
       hostId,
       guestId,
       communityId: params.route.communityId ,
       communityRoleId: data.roleId
    }));
    console.log('Invitations to create:==>>', invitationsToCreate);
    
    const createdInvitations = await super.create(invitationsToCreate, params);
    console.log('Created invitations:==>>', createdInvitations);
    return createdInvitations;
  }

  
}
