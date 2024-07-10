

describe('\'addressTypes\' service', () => {
  it('registered the service', () => {
    const service = global.__APP__.service('address-types');
    expect(service).toBeTruthy();
  });
  it('should return a list of address types', async () => {
    const authenticatedUser = (await global.__getRandUsers(1))[0];

    const addressTypes = await global.__SERVER__.get('/address-types').set('authorization', authenticatedUser.accessToken);

    expect(addressTypes.body.data).toBeInstanceOf(Array);
    expect(addressTypes.body.data.length).toBeGreaterThan(0);

  });


});
