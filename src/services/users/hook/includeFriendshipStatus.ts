import { HookContext } from '@feathersjs/feathers';

/**
 * Hook to include friendship status when fetching a user
 * Adds friendship information between the signed-in user and the fetched user
 *
 * Returns:
 * - 'sent': signed-in user sent a pending request
 * - 'received': signed-in user received a pending request
 * - 'accepted': they are friends (mutual)
 * - null: no friendship exists
 */
export default async (context: HookContext): Promise<HookContext> => {
  // Only run for authenticated external requests
//   if (!context.params.provider || !context.params.User?.id) {
//     return context;
//   }

  const signedInUserId = context.params.User.id;

  // Initialize sequelize params if not present
  if (!context.params.sequelize) {
    context.params.sequelize = {};
  }

  // Add attributes to include friendship status
  if (!context.params.sequelize.attributes) {
    context.params.sequelize.attributes = { include: [] };
  }

  // Add a literal to check friendship status in both directions
  const sequelize = context.app.get('sequelizeClient');

  // Add subquery to get the entire friendship object as JSON
  // Returns the friendship record or null if no friendship exists
  context.params.sequelize.attributes.include.push([
    sequelize.literal(`(
      SELECT json_build_object(
        'id', id,
        'userId', user_id,
        'targetId', target_id,
        'status', status,
        'createdAt', created_at,
        'updatedAt', updated_at
      )
      FROM friendships
      WHERE (
        (friendships.user_id = '${signedInUserId}' AND friendships.target_id = "User".id)
        OR
        (friendships.user_id = "User".id AND friendships.target_id = '${signedInUserId}')
      )
      LIMIT 1
    )`),
    'friendship'
  ]);

  return context;
};
