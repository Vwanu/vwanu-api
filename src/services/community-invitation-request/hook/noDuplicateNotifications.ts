import { BadRequest } from '@feathersjs/errors';
import { HookContext } from '@feathersjs/feathers';

const noDuplicateInvitation = async (context:HookContext): Promise<HookContext> => {
  const { app, data } = context;
  const { guestId, hostId, CommunityId } = data;

  try {
    const { CommunityInvitationRequest } = app.get('sequelizeClient').models;
    const existingInvitation = await CommunityInvitationRequest.findOne({
      where: {
        guestId,
        hostId,
        CommunityId,
        response: null,
      },
    });
    if (existingInvitation)
      throw new BadRequest(
        'This person already has an invitation for this community'
      );
  } catch (e: unknown | any) {
    throw new BadRequest(e);
  }

  return context;
};

export default noDuplicateInvitation;