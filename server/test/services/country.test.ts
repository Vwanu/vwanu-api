
describe("'country' service", () => {
  it('registered the service', () => {
    const service = global.__APP__.service('country');
    expect(service).toBeTruthy();
  });

  it('should return a list of countries', async () => {
    const authenticatedUser = (await global.__getRandUsers(1))[0];

    await global.__SERVER__
      .get('/country')
      .set('authorization', authenticatedUser.accessToken)
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeInstanceOf(Array);
      });



  });
});
