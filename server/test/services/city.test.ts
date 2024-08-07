import { StatusCodes } from 'http-status-codes';

describe('\'city \' service', () => {
  it('registered the service', () => {
    const service = global.__APP__.service('city');
    expect(service).toBeTruthy();
  });


  it('should return a list of cities', async () => {
    const authenticatedUser = (await global.__getRandUsers(1))[0];

    return global
      .__SERVER__
      .get('/city')
      .set('authorization', authenticatedUser.accessToken)
      .expect(StatusCodes.OK)
      .expect((res) => {
        expect(res.body).toBeInstanceOf(Array)
      });

  });
});
