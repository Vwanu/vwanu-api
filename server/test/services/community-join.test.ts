import { randomBytes } from 'crypto';
import { StatusCodes } from "http-status-codes";

describe(" Community join service", () => {

  const endpoint = '/community-join';
  const communityEndpoint = '/communities';

  it('registered the service', () => {
    const service = global.__APP__.service('community-join');
    expect(service).toBeTruthy();
  });

  it('Can join any public community', async () => {

    const [creator, user] = await global.__getRandUsers(2);

    const publicCommunity = await global.__SERVER__
      .post(communityEndpoint).send({
        name: `${randomBytes(5).toString('hex')}`,
        privacyType: 'public',
        description: `${randomBytes(10).toString('hex')}`,
      })
      .set('authorization', creator.accessToken)
      .expect(StatusCodes.CREATED)



    return global.__SERVER__
      .post(endpoint)
      .send({ CommunityId: publicCommunity.body.id })
      .set('authorization', user.accessToken)
      .expect(StatusCodes.CREATED);


  });

  it('Cannot Join same community twice', async () => {
    const [creator, user] = await global.__getRandUsers(2);

    const publicCommunity = await global.__SERVER__
      .post(communityEndpoint).send({
        name: `${randomBytes(5).toString('hex')}`,
        privacyType: 'public',
        description: `${randomBytes(10).toString('hex')}`,
      })
      .set('authorization', creator.accessToken)
      .expect(StatusCodes.CREATED)

    await global.__SERVER__
      .post(endpoint)
      .send({ CommunityId: publicCommunity.body.id })
      .set('authorization', user.accessToken)
      .expect(StatusCodes.CREATED);

    await global.__SERVER__
      .post(endpoint)
      .send({ CommunityId: publicCommunity.body.id })
      .set('authorization', user.accessToken)
      .expect(StatusCodes.BAD_REQUEST);
  });

  it('Hidden does not accept join request', async () => {
    const [creator, user] = await global.__getRandUsers(2);

    const comunity = await global.__SERVER__
      .post(communityEndpoint).send({
        name: `${randomBytes(5).toString('hex')}`,
        privacyType: 'public',
        description: `${randomBytes(10).toString('hex')}`,
      })
      .set('authorization', creator.accessToken)
      .expect(StatusCodes.CREATED)

    await global.__SERVER__
      .post(endpoint)
      .send({ CommunityId: comunity.id })
      .set('authorization', user.accessToken)
      .expect(StatusCodes.BAD_REQUEST);
  });

});
