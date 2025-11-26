import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';
import { BadRequest } from '@feathersjs/errors';
import type { Community } from '@root/database/communities';
import type { CommunityUser } from '@root/database/community-users';
import type { CommunityInvitationRequest as Bodel } from '@root/database/communityInvitationRequest';

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
        { model: models.CommunityUser, as: 'members' },
      ],
    }) as (Community & { members: CommunityUser[] }) | null;

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

  async remove(id: string, params?: any): Promise<any> {
    const { models } = this.app.get('sequelizeClient');

    // Get current user ID from params
    const currentUserId = params?.User?.id || params?.cognitoUser?.id;
    if (!currentUserId) {
      throw new BadRequest('User not authenticated');
    }

    // Fetch the invitation with host information
    const invitation = await this.Model.findByPk(id, {
      include: [
        {
          model: models.User,
          as: 'host',
        }
      ]
    }) as Bodel | null;

    if (!invitation)
      throw new BadRequest('Invitation not found');

    // Check 1: Invitation must not have been responded to
    if (invitation.response !== null)
      throw new BadRequest('Cannot delete an invitation that has already been responded to');

    // Check 2: User must be the host OR have higher rank than the host
    const isHost = invitation.hostId === currentUserId;

    if (!isHost) {
      // If not the host, check if current user has higher rank in the community
      const hostMember = await models.CommunityUsers.findOne({
        where: {
          userId: invitation.hostId,
          communityId: invitation.communityId,
        },
        include: [
          {
            model: models.CommunityRoles,
            as: 'communityRole',
          }
        ]
      }) as CommunityUser | null;

      const currentUserMember = await models.CommunityUsers.findOne({
        where: {
          userId: currentUserId,
          communityId: invitation.communityId,
        },
        include: [
          {
            model: models.CommunityRoles,
            as: 'communityRole',
          }
        ]
      }) as CommunityUser | null;

      // Current user must be a member of the community
      if (!currentUserMember) {
        throw new BadRequest('You are not a member of this community');
      }

      // Host must be a member (should always be true, but safety check)
      if (!hostMember) {
        throw new BadRequest('Invitation host is not a member of this community');
      }

      // Check rank: lower roleAccessLevel = higher rank (0=admin, 1=moderator, 2=member)
      const currentUserRank = currentUserMember.communityRole?.roleAccessLevel;
      const hostRank = hostMember.communityRole?.roleAccessLevel;

      if (currentUserRank == null || hostRank == null) {
        throw new BadRequest('Unable to determine user roles');
      }

      // Current user must have higher rank (lower or equal roleAccessLevel) than host
      if (currentUserRank > hostRank) {
        throw new BadRequest('You do not have permission to delete this invitation. Only the host or users with higher rank can delete invitations.');
      }
    }

    return super.remove(id, params);
  }

  
}
