import { HookContext } from '@feathersjs/feathers';

const UserAttributes = [
  'firstName',
  'lastName',
  'id',
  'profilePicture',
  'createdAt',
];
export default async (context: HookContext) => {
  const { data, result, app, params } = context;
  const rawInterests = data.interests ?? params._interests;
  if (!rawInterests) return context;
  const interests = Array.isArray(rawInterests) ? rawInterests : [rawInterests];

    console.log('🆘🆘🆘🆘🆘🆘🆘🆘🆘🆘 Interests in SaveInterest hook:', interests);
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
