import { StatusCodes } from "http-status-codes";

describe('\'state \' service', () => {
  it('registered the service', () => {
    const service = global.__APP__.service('state');
    expect(service).toBeTruthy();
  });


  it('should return a list of states', async () => {
    const authenticatedUser = (await global.__getRandUsers(1))[0];

    return global
      .__SERVER__
      .get('/state')
      .set('authorization', authenticatedUser.accessToken)
      .expect(StatusCodes.OK)
      .expect((res) => {
        expect(res.body).toBeInstanceOf(Array)
      });
  });
});
