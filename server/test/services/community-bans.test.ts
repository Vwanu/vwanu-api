
import { StatusCodes } from "http-status-codes";

describe("Community bans service service", () => {

  const testServer = global.__SERVER__;
  const communityEndpoint = '/communities';
  const endpoint = '/community-bans';
  const joinEndpoint = '/community-join';
  const sequelize = global.__SEQUELIZE__;

  let publicCommunity;
  let testUsers;
  let creator;
  let nonAdminUser;

  beforeAll(async () => {

    [creator, nonAdminUser, ...testUsers] = await global.__getRandUsers(7);

    publicCommunity = (await testServer
      .post(communityEndpoint)
      .send({
        name: `New community-${Math.random()}`,
        description: `You will be banned -${Math.random()}`,
      })
      .set('authorization', creator.accessToken)).body;





  }, 100000);


  // afterAll(async () => {
  //   const { CommunityUsers, Community, CommunityHistory } = sequelize.models;
  //   await Promise.all(
  //     [CommunityUsers, Community, CommunityHistory].map(async (model) => {
  //       await model.destroy({ where: {} })
  //       return null;
  //     }
  //     )
  //   );

  //   sequelize.close();
  // });

  it('registered the service', () => {
    const service = global.__APP__.service('community-bans');
    expect(service).toBeTruthy();
  });

  it('Non admin cannot ban user from community', async () => {

    const user = testUsers[0];

    return testServer
      .post(endpoint)
      .send({
        userId: user.id,
        communityId: publicCommunity.id,
        comment: 'You will be banned',
      })
      .set('authorization', nonAdminUser.accessToken)
      .expect(StatusCodes.BAD_REQUEST);

  });

  it('Authorised members can ban user from communities', async () => {

    const resp = await testServer
      .post(endpoint)
      .send({
        userId: testUsers[0].id,
        communityId: publicCommunity.id,
        comment: 'You will be banned',
      })
      .set('authorization', creator.accessToken)
    // .expect(StatusCodes.CREATED)

    console.log('ban attemps response', resp.body)
  }

  );

  it('user are removed from the community when banned', async () => {

    const user = testUsers[1];

    const searchUuser = await
      sequelize.models.CommunityUsers.findOne({
        where: { UserId: user.id, CommunityId: publicCommunity.id },
      })
    expect(searchUuser).toBeTruthy();

    await testServer
      .post(endpoint)
      .send({
        userId: user.id,
        communityId: publicCommunity.id,
        comment: 'You will be banned',
      })
      .set('authorization', creator.accessToken)
      .expect(StatusCodes.CREATED)


    const reloadUser = await
      sequelize.models.CommunityUsers.findOne({
        where: { UserId: user.id, CommunityId: publicCommunity.id },
      })
    expect(reloadUser).toBeNull();

  });

  it('Will not ban a user twice', async () => {
    const user = testUsers[2];
    await testServer
      .post(endpoint)
      .send({
        userId: user.id,
        communityId: publicCommunity.id,
        comment: 'You will be banned',
      })
      .set('authorization', creator.accessToken)
      .expect(StatusCodes.CREATED)

    return testServer
      .post(endpoint)
      .send({
        userId: user.id,
        communityId: publicCommunity.id,
        comment: 'You will be banned',
      })
      .set('authorization', creator.accessToken)
      .expect(StatusCodes.BAD_REQUEST)
  });
});
