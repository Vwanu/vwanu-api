import { HookContext } from '@feathersjs/feathers';

const UserAttributes = [
  'firstName',
  'lastName',
  'id',
  'profilePicture',
  'createdAt',
];
export default async (context: HookContext) => {
  const { data, result, app } = context;
  if (!data.interests) return context;
  const interests = Array.isArray(data.interests)
    ? data.interests
    : [data.interests];
  const {
    Interest: InterestModel,
    BlogInterest: BlogInterestTable,
    Blog: BlogModel,
    User: UserModel,
  } = app.get('sequelizeClient').models;

  await Promise.all(
    interests.map((interest, idx) =>
      BlogInterestTable.findOrCreate({
        where: { blogId: result.id, interestId: interests[idx]},
      })
    )
  );

  const blog = await BlogModel.findByPk(result.id, {
    include: [
      { model: InterestModel },
      {
        model: UserModel,
        attributes: UserAttributes,
      },
    ],
  });
  context.result = blog;
  return context;
};
