describe("'address' service", () => {
  // eslint-disable-next-line no-unused-vars

  let testUsers;
  const userEndpoint = '/users';

  beforeAll(async () => {
    testUsers = await global.__getRandUsers(2);
  }, 1000);

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

    const address = {
      // street: '123 Fake Street',
      city: city[0].id,
      state: state[0].id,
      country: state[0].CountryId,
      addressType: addressTypes[0].id,
      // streetType: 'Street',
    };


    expect(true).toBe(true)

    // // Patch address to user authenticated
    const { statusCode: patchStatusCode } = await global.__SERVER__
      .patch(`${userEndpoint}/${testUsers[0].id}`)
      .set('authorization', testUsers[0].accessToken)
      .send({ address });



    expect(patchStatusCode).toBe(200);

    // const { body: addressFromDB } = await global.__SERVER__
    //   .get(`${userEndpoint}/${userWithAddress.id}`)
    //   .set('authorization', testUsers[0].accessToken);

    // expect(addressFromDB.Addresses[0]).toMatchObject({
    //   id: expect.any(String),
    //   // street: null,
    //   country: fakeCountries[0].name,
    //   state: fakeStates[0].name,
    //   city: fakeCities[0].name,
    //   addressType: addressTypes[0].description,
    // });
  });
  it.todo('Should be able to get all addresses of a user');
  it.todo("Should be able to update an user's address");
  it.todo("Should be able to delete an user's address");
  it.todo("User's address should show show user's basic attributes");
  it.todo(
    'address must contain address type , user details , and address information'
  );
});

// describe('User Address', () => {
//   let countries;
//   let states;
//   let cities;
//   beforeAll(async () => {
//     await sequelize.sync({ force: true });
//     countries = await Promise.all(
//       [
//         { name: 'Katchopa', initials: 'kp' },
//         { name: 'Boyo', initials: 'by' },
//       ].map((c) => global.__SERVER__.post('/countries').send(c))
//     );
//   });
//   it.skip('should create users with address', async () => {
//     console.log(countries[0].body);
//     const responses = await Promise.all(
//       getRandUsers(2).map((u) => {
//         const user = u;
//         delete user.id;
//         return global.__SERVER__.post(endpoint).send({ ...user, interests });
//       })
//     );
//     responses.forEach(({ statusCode }) => {
//       expect(statusCode).toBe(201);
//     });
//   });
//   it.todo('Each users have an address');
//   it.todo('User has an address');
//   it.todo('User can add an address');
//   it.todo('User can update his address');
//   it.todo('User can delete his address');
// });
