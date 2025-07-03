/* eslint-disable no-underscore-dangle */
import { HookContext } from '@feathersjs/feathers';
import { BadRequest } from '@feathersjs/errors';

export default async (context: HookContext) => {
  const { params, id, service } = context;

  // Get the Cognito user
  const { cognitoUser } = params;
  if (!cognitoUser) {
    throw new BadRequest('User not authenticated');
  }

  // For backwards compatibility
  if (!params.User) {
    params.User = {
      id: cognitoUser.id,
    };
  }

  const entity = await service._get(id);

  // Check if the authenticated user is the owner
  if (entity.UserId && entity.UserId !== cognitoUser.id) {
    throw new BadRequest('Only the owner can update a post');
  }

  return context;
};
