import { BadRequest } from '@feathersjs/errors';

export default (context) => {
  // Get the Cognito user
  const { cognitoUser } = context.params;
  if (!cognitoUser) {
    throw new BadRequest('User not authenticated');
  }

  // For backwards compatibility
  // if (!context.params.User) {
  //   context.params.User = {
  //     id: cognitoUser.attributes.sub,
  //   };
  // }

  // Check if the user is trying to modify their own profile
  if (context.id.toString() !== cognitoUser.id.toString()) {
    throw new BadRequest('Invalid Parameters', {
      message: 'You are not authorized to modify other users',
    });
  }

  return context;
};
