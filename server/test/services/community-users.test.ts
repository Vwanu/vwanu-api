import { randomBytes } from 'crypto';
import { StatusCodes } from 'http-status-codes';

describe("'community-users ' service", () => {

  const testServer = global.__SERVER__;
  const endpoint = '/community-users';
  const communityEndpoint = '/communities';


  it('registered the service', () => {
    const service = global.__APP__.service('community-users');
    expect(service).toBeTruthy();
  });

  it('Should return the users of a given community', async () => {

    const [adminUser] = await global.__getAdminUsers(1);

    const com = await testServer
      .post(communityEndpoint)
      .send({
        name: 'test community',
        description: 'test community description',
      }).set('authorization', adminUser.accessToken)
      .expect(StatusCodes.CREATED);


    await testServer
      .get(`${endpoint}/?CommunityId=${com.body.id}`)
      .set('authorization', adminUser.accessToken)
      .expect(StatusCodes.OK)
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.body.data).toEqual(expect.arrayContaining([]));
        expect(res.body.total).toBe(1);
      });
  });

  it('should verify if the user is a member of the community', async () => {

    const [creator, noneMember] = await global.__getRandUsers(2);

    const com = await testServer
      .post(communityEndpoint)
      .send({
        name: randomBytes(5).toString('hex'),
        description: randomBytes(10).toString('hex'),
      }).set('authorization', creator.accessToken)
      .expect(StatusCodes.CREATED);

    await testServer
      .get(`${endpoint}/?CommunityId=${com.body.id}&UserId=${noneMember.id}`)
      .set('authorization', creator.accessToken)
      .expect(StatusCodes.OK)
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.body.data).toEqual(expect.arrayContaining([]));
        expect(res.body.total).toBe(0);
      });

    await testServer
      .get(`${endpoint}/?CommunityId=${com.body.id}&UserId=${creator.id}`)
      .set('authorization', creator.accessToken)
      .expect(StatusCodes.OK)
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.body.data).toEqual(expect.arrayContaining([]));
        expect(res.body.total).toBe(1);
      });


  });

  it.todo('should not banned a user of the community');
  it.todo('should  ban a user of the community');
});
