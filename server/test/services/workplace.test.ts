import { StatusCodes } from "http-status-codes";

describe("'workplace' service", () => {

  const testServer = global.__SERVER__;
  let firstUser;


  it('registered the service', () => {
    const service = global.__APP__.service('workplace');
    expect(service).toBeTruthy();
  });

  it('Should be able to register an worplace and a user', async () => {
    const workPlace = {
      name: 'vwanu inc',
      description: "vwanu's workplace",
      from: '2021-01-01',
      to: '2021-01-01',
    };



    [firstUser] = await global.__getRandUser(1);

    await testServer
      .patch(`users/${firstUser.id}`)
      .send({
        workPlace,
      }).set('authorization', firstUser.accessToken)
      .expect(StatusCodes.OK);
    const { WorkPlace, UserWorkPlace } = global.__SEQUELIZE__.models;

    const Workplaces = await WorkPlace.findOne({
      where: { name: workPlace.name },
    });
    expect(Workplaces).toMatchObject({
      id: expect.any(String),
      name: workPlace.name,
    });

    const userWorplaces = await UserWorkPlace.findOne({
      where: { WorkPlaceId: Workplaces.id, UserId: firstUser.id },
    });

    expect(userWorplaces).toMatchObject({
      description: workPlace.description,
    });
  });

  it('should pull a user with his workplace', async () => {
    const { body: userFromServer } = await testServer
      .get(`users/${firstUser.id}`)
      .set('authorization', firstUser.accessToken);

    expect(userFromServer.WorkPlaces).toBeDefined();
    expect(userFromServer.WorkPlaces).toHaveLength(1);
  });
});
