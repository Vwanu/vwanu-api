export default function (context) {
  // Get user ID from Cognito user details
  const { cognitoUser } = context.params;

  if (!cognitoUser) {
    throw new Error('User not authenticated');
  }

  // Use the sub attribute as the user ID
  context.data.userId = cognitoUser.id;
  context.data.creatorId = cognitoUser.id;
  console.log('AutoOwn Hook applied: Set userId and creatorId to', cognitoUser.id);

  // For backwards compatibility
  context.params.User = {
    id: cognitoUser.id,
  };

  return context;
}
