/* eslint-disable no-underscore-dangle */
import { HookContext } from '@feathersjs/feathers';
import isNill from 'lodash/isNil';
// @ts-ignore
import { Op } from 'sequelize';

export default async (context: HookContext) => {
  const { params, app, method } = context;
  const Sequelize = app.get('sequelizeClient');
  const { User } = params;
  if (isNill(User))
    throw new Error('Only authenticated users can access this service.');

  const isParticipant = `(
    EXISTS (
    SELECT 1 FROM "conversation_users" AS "CU"
    WHERE "CU"."user_id"='${context.params.User.id}' AND "CU"."conversation_id"= "Conversation"."id"
    )
  )`;

  const amountOfUnreadMessages = `(
    SELECT
    COUNT(DISTINCT "M"."id")
    FROM "messages" AS "M"
    WHERE "M"."conversation_id"="Conversation"."id"
    AND "M"."read_date" IS NULL AND "M"."user_id" != '${context.params.User.id}'
    )::int`;

  const amountOfPeople = `(
    SELECT
    COUNT(DISTINCT "CU"."user_id")
    FROM "conversation_users" AS "CU"
    WHERE "CU"."conversation_id"="Conversation"."id")::int`;

  const Users = `(
    SELECT
    json_agg(
    json_build_object(
      'id', "U"."id",
      'firstName',"U"."first_name",
      'lastName',"U"."last_name",
      'createdAt',"U"."created_at",
      'updatedAt',"U"."updated_at",
      'profilePicture',"U"."profile_picture"
    )
      )
     FROM "conversation_users" AS "CU"
     INNER JOIN "users" AS "U" ON "U"."id" = "CU"."user_id"
     WHERE "CU"."conversation_id"="Conversation"."id"
     AND "U"."id" != '${context.params.User.id}'
  )`;

  const lastMessage = `(
    SELECT
    json_build_object(
      'id', "M"."id",
      'messageText',"M"."message_text",
      'createdAt',"M"."created_at",
      'readDate',"M"."read_date",
      'receivedDate',"M"."received_date",
      'conversationId',"M"."conversation_id",
      'updatedAt',"M"."updated_at",
      'userId',"M"."user_id",
      'senderFirstName',"U"."first_name",
      'senderLastName',"U"."last_name",
      'senderProfilePicture',"U"."profile_picture"
    )
    FROM "messages" AS "M"
    INNER JOIN "users" AS "U" ON "U"."id" = "M"."user_id"
    WHERE "M"."conversation_id"="Conversation"."id"
    ORDER BY "M"."created_at" DESC
    LIMIT 1
  )`;



  const { query: where } = context.app
    .service(context.path)
    .filterQuery(context.params);

  if (method === 'get') where.id = context.id;
  const clause = {
    ...where,
    [Op.and]: [Sequelize.where(Sequelize.literal(isParticipant), true)],
  };
  params.sequelize = {
    // logging: console.log,
    where: clause,
    attributes: {
      include: [
        [Sequelize.literal(Users), 'users'],
        [Sequelize.literal(lastMessage), 'lastMessage'],
        [Sequelize.literal(amountOfPeople), 'amountOfPeople'],
        [Sequelize.literal(amountOfUnreadMessages), 'amountOfUnreadMessages'],
      ],
      exclude: ['amountOfMessages', 'amountOfUnreadMessages', 'amountOfPeople'],
    },

    // include: [
    //   {
    //     model: Sequelize.models.Conversation_Users,
    //     attribute: [],
    //     // required: true,
    //   },
    // ],
    raw: false,
  };
  // try {
  //   const result = await app.service('conversation-users')._find({
  //     query: { UserId: User.id },
  //     User,
  //     // paginate: false,
  //   });

  //   context.result = result;
  // } catch (err) {
  //   throw new GeneralError(
  //     `We could not find your conversation due to ${err.message}`
  //   );
  // }

  return context;
};
