export default function (context) {
  // Get user ID from Cognito user details
  const { cognitoUser } = context.params;

  if (!cognitoUser) {
    throw new Error('User not authenticated');
  }

  // Use the sub attribute as the user ID
  context.data.UserId = cognitoUser.attributes.sub;

  // For backwards compatibility
  context.params.User = {
    id: cognitoUser.attributes.sub,
  };

  return context;
}
