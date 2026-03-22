import { HookContext } from '@feathersjs/feathers';

export default (context: HookContext) => {
    console.log('❤️‍🔥🆘💙[AddIsReactor] hook called with context:');
    const userId = context.params?.User?.id || context.params?.cognitoUser?.id;
    if (!userId) return context;
    const Sequelize = context.app.get('sequelizeClient');
     console.log('❤️‍🔥🆘💙[AddIsReactor] hook called with context:');

    const isReactor = `(
SELECT
  json_agg(
    json_build_object(
     'id', k."id",
     'createdAt',k.created_at,
     'updatedAt',k.updated_at
    )
    )
    FROM korems AS k
    WHERE k.entity_id="ForumDiscussion".id
       AND k.entity_type='Discussion' AND k.user_id='${userId}'
  )`;

    const sequelize = context.params.sequelize || {};
    const attributes = sequelize.attributes || {};
    const include = attributes.include || [];

    include.push([Sequelize.literal(isReactor), 'isReactor']);

    attributes.include = include;
    sequelize.attributes = attributes;
    context.params.sequelize = sequelize;

    return context;
};
