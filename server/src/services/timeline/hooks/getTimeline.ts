// import isEmpty from 'lodash/isEmpty';
import { Op } from '@sequelize/core';

const UserAttributes = [
  'first_name',
  'last_name',
  'id',
  'profile_picture',
  'created_at',
];
export default (context) => {
  const { app, params } = context;
  const Sequelize = app.get('sequelizeClient');

  const amountOfComments = `(
      SELECT 
      COUNT(*) 
      FROM posts WHERE posts.post_id = posts.id
    )::int`;
  // const amountOfReactions = `(
  //     SELECT 
  //     COUNT("R"."id") 
  //     FROM "Reactions" AS "R"
  //     WHERE "R"."entityId" = "Post"."id" AND "R"."entityType"='Post'
  //   )::int`;
  //   const isReactor = `(
  // SELECT 
  //   json_agg(
  //     json_build_object(
  //      'id', "R"."id",
  //      'content',"R"."content",
  //      'created_at',"R"."created_at",
  //      'updated_at',"R"."updated_at"
  //     ) 
  //     ) 
  //     FROM "Reactions" AS "R"
  //     WHERE "R"."entityId"="Post"."id" AND  "R"."entityType"='Post' AND "R"."user_id"='${context.params.User.id}'
  //   )`;
  const friends = `(
     EXISTS(
      SELECT 1 FROM "friends" WHERE "friends"."user_one_id" = "posts"."user_id" AND "friends"."user_two_id" = '${params.User.id}'
     )
    )`;

  // const WallUser = `(
  // SELECT 
  // json_build_object(
  //  'first_name', "U"."first_name",
  //  'last_name', "U"."last_name",
  //  'id', "U"."id",
  //  'profile_picture', "U"."profile_picture",
  //  'created_at' ,"U"."created_at"
  //  )
  // FROM "Users" AS "U"
  // WHERE  "Post"."wallId" IS NOT NULL AND "U"."id" = "Post"."wallId"
  // )`;

  const Original = `(
  SELECT
  CASE 
  WHEN "Post"."original_id" IS NULL THEN NULL
  WHEN "Post"."original_type" = 'Post' THEN
  (
  SELECT 
  json_build_object(
    'id', "P"."id",
    'content', "P"."post_text",
    'createdAt', "P"."created_at",
    'updatedAt', "P"."updated_at",
    'firstName', "U"."first_name",
    'lastName', "U"."last_name",
    'UserId', "U"."id",
    'profilePicture', "U"."profile_picture"
  )
    FROM "posts" AS "P" 
    INNER JOIN "users" AS "U" ON "U"."id" = "P"."user_id"
    WHERE "P"."id" = "Post"."original_id"
    LIMIT 1
    )
  -- WHEN "Post"."original_type" = 'Blogs' THEN
  -- (
  -- SELECT
  -- json_build_object(
  --  'id', "B"."id",
  --  'content', "B"."blog_text",
  --  'created_at', "B"."created_at",
  --  'updated_at', "B"."updated_at",
  --  'coverPicture', "B"."coverPicture",
  --  'firstName', "U"."first_name",
  --  'lastName', "U"."last_name",
  --  'UserId', "U"."id",
  --  'profile_picture', "U"."profile_picture",
  --  'title', "B"."blogTitle"
  --)
  --  FROM "blogs" AS "B"
  --  INNER JOIN "users" AS "U" ON "U"."id" = "B"."user_id"
  --  WHERE "B"."id" = "Post"."original_id"
  --  LIMIT 1
  --)
  WHEN "Post"."original_type" = 'Discussion' THEN
  (
  SELECT
  json_build_object(
    'id', "D"."id",
    'content', "D"."body",
    'created_at', "D"."created_at",
    'updated_at', "D"."updated_at",
    'first_name', "U"."first_name",
    'last_name', "U"."last_name",
    'user_id', "U"."id",
    'profile_picture', "U"."profile_picture"
  )
    FROM "discussions" AS "D"
    INNER JOIN "users" AS "U" ON "U"."id" = "D"."user_id"
    WHERE "D"."id" = "Post"."original_id"
    LIMIT 1
  )
  END
)`;

  const CanDelete = `(
    CASE 
    WHEN "Post"."user_id" = '${params.User.id}' THEN true
    -- WHEN "Post"."wallId" = '${params.User.id}' THEN true
    WHEN "Post"."post_id" IS NOT NULL 
    AND  EXISTS( 
     Select 1
     FROM "posts" as "P"
     WHERE "P"."id" = "Post"."post_id" AND "P"."user_id" = '${params.User.id}')
    THEN true
    ELSE false
    END)`;

  const { query: where } = context.app
    .service(context.path)
    .filterQuery(context.params);

  const single = context.method === 'get';
  const queryString = /* isEmpty(where)
    ? */ {
    PostId: null,
    ...where,
    [Op.and]: {
      [Op.or]: [
        { privacyType: 'public' },
        { user_id: params.User.id },
        // {
        //   [Op.and]: [{ privacyType: 'friends' }, Sequelize.literal(friends)],
        // },
      ],
    },
  };
  /*: { ...where }; */

  const clause = single ? { id: context.id } : queryString;

  params.sequelize = {
    // logging: console.log,
    where: clause,
    attributes: {
      include: [
        [Sequelize.literal(amountOfComments), 'amountOfComments'],
        // [Sequelize.literal(amountOfReactions), 'amountOfReactions'],
        // [Sequelize.literal(isReactor), 'isReactor'],
        // [Sequelize.literal(WallUser), 'WallUser'],
        [Sequelize.literal(Original), 'Original'],
        [Sequelize.literal(CanDelete), 'canDelete'],
      ],
      exclude: ['user_id'],
    },

    include: [
      {
        model: Sequelize.models.User,
        attributes: UserAttributes,
        required: true,
      },
      // {
      //   model: Sequelize.models.Community,
      // },
      {
        model: Sequelize.models.Media,
        include: {
          model: Sequelize.models.User,
          attributes: UserAttributes,
        },
      },
    ],
    raw: false,
  };

  return context;
};
