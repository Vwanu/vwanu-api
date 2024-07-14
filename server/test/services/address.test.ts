describe("'address' service", () => {
  let testUsers;
  const userEndpoint = '/users';

  beforeAll(async () => {
    testUsers = await global.__getRandUsers(2);
  }, 10000);

  afterAll(async () => {
    await Promise.all(
      testUsers.map((user) =>
        global.__SERVER__
          .delete(`${userEndpoint}/${user.id}`)
          .set('authorization', ` ${user.accessToken}`)
      )
    );
  });

  it('registered the service', () => {
    const service = global.__APP__.service('address');
    expect(service).toBeTruthy();
  });

  it('should be able to register a user then patch an address', async () => {

    const { State, City, AddressTypes } = global.__SEQUELIZE__.models;

    const addressTypes = await AddressTypes.findAll({ limit: 1 });
    const state = await State.findAll({ limit: 1 });
    const city = await City.findAll({ limit: 1, where: { StateId: state[0].id } });
    // // Patch address to user authenticated
    const { statusCode } = await global.__SERVER__
      .patch(`${userEndpoint}/${testUsers[0].id}`)
      .set('authorization', testUsers[0].accessToken)
      .send({
        address: {
          city: city[0].id,
          state: state[0].id,
          country: state[0].CountryId,
          addressType: addressTypes[0].id,
        }
      });

    expect(statusCode).toBe(200);


  });

  it.skip('Should return the user with his address', async () => {

    const { body: addressFromDB } = await global.__SERVER__
      .get(`${userEndpoint}/${testUsers[0].id}`)
      .set('authorization', testUsers[0].accessToken);

    expect(addressFromDB.Addresses[0]).toMatchObject({
      id: expect.any(String),
      country: expect.any(String),
      state: expect.any(String),
      city: expect.any(String),
      addressType: expect.any(String),
    });
  });

  it.todo("Should be able to update an user's address");
  it.todo("Should be able to delete an user's address");

});
