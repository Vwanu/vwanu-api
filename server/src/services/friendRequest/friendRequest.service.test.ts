import { StatusCodes } from 'http-status-codes';

describe('Friend Request service, ', () => {
  const endpoint = '/friendRequest';

  it(' The friendRequest service is running ', () => {
    const service = global.__APP__.service('friendRequest');
    expect(service).toBeDefined();
  });

  it('should be able to send a friend request', async () => {
    const [requester, requestee] = await global.__getRandUsers(2);

    await global.__SERVER__
      .post(endpoint)
      .send({ UserID: requestee.id })
      .set('authorization', requester.accessToken)
      .expect(StatusCodes.CREATED);


  });

  it('should not be able to send second friend request if one exit', async () => {

    const [requester, requestee] = await global.__getRandUsers(2);

    await global.__SERVER__
      .post(endpoint)
      .send({ UserID: requestee.id })
      .set('authorization', requester.accessToken)
      .expect(StatusCodes.CREATED);



    await global.__SERVER__
      .post(endpoint)
      .send({ UserID: requestee.id })
      .set('authorization', requester.accessToken)
      .expect(StatusCodes.BAD_REQUEST);

  });

  it('should be able to see all friend request sent ', async () => {
    const [requester, requestee] = await global.__getRandUsers(2);

    const response = await global.__SERVER__
      .get(`${endpoint}/?action=people-i-want-to-be-friend-with`)
      .set('authorization', requester.accessToken)
      .expect(StatusCodes.OK);

    expect(response.body.total).toEqual(0);

    await global.__SERVER__
      .post(endpoint)
      .send({ UserID: requestee.id })
      .set('authorization', requester.accessToken)
      .expect(StatusCodes.CREATED);

    const response2 = await global.__SERVER__
      .get(`${endpoint}/?action=people-i-want-to-be-friend-with`)
      .set('authorization', requester.accessToken)
      .expect(StatusCodes.OK);

    expect(response2.body.total).toBe(1);

    // expect(response.body.data).toEqual(
    //   expect.arrayContaining([
    //     expect.objectContaining({
    //       User: expect.objectContaining({
    //         firstName: requestee.firstName,
    //         lastName: requestee.lastName,
    //         id: requestee.id,
    //         profilePicture: expect.any(String),
    //       })
    //     }),
    //   ])
    // );

  });

  it('should be able to see all friend request receive', async () => {
    const [requester, requestee] = await global.__getRandUsers(2);

    const response = await global.__SERVER__
      .get(`${endpoint}/?action=people-who-want-to-Be-my-friend`)
      .set('authorization', requestee.accessToken)
      .expect(StatusCodes.OK);

    expect(response.body.total).toEqual(0);

    await global.__SERVER__
      .post(endpoint)
      .send({ UserID: requestee.id })
      .set('authorization', requester.accessToken)
      .expect(StatusCodes.CREATED);

    const response2 = await global.__SERVER__
      .get(`${endpoint}/?action=people-who-want-to-Be-my-friend`)
      .set('authorization', requestee.accessToken)
      .expect(StatusCodes.OK);

    expect(response2.body.total).toBe(1);

    // expect(response.body.data).toEqual(
    //   expect.arrayContaining([
    //     expect.objectContaining({
    //       firstName: requester.firstName,
    //       lastName: requester.lastName,
    //       id: requester.id,
    //       profilePicture: expect.any(String),
    //     }),
    //   ])
    // );
    // expect(response.status).toBe(StatusCodes.OK);
  });

  it('should be able to deny the friend request', async () => {
    const [requester, requestee] = await global.__getRandUsers(2);

    await global.__SERVER__
      .post(endpoint)
      .send({ UserID: requestee.id })
      .set('authorization', requester.accessToken)
      .expect(StatusCodes.CREATED);

    await global.__SERVER__
      .patch(endpoint)
      .send({ friendId: requester.id, accept: false })
      .set('authorization', requestee.accessToken)
      .expect(StatusCodes.OK);


    const u = await global.__SEQUELIZE__.query(`
      SELECT user_id, undesired_user_id
       FROM undesired_friends 
       WHERE undesired_friends.user_id = '${requestee.id}' 
       AND undesired_friends.undesired_user_id = '${requester.id}'; `
    );

    expect(u).toBeDefined();





  });

  it('should not be able to send other friend request if denied previousLy', async () => {
    const [requester, requestee] = await global.__getRandUsers(2);
    await global.__SERVER__
      .post(endpoint)
      .send({ UserID: requestee.id })
      .set('authorization', requester.accessToken)
      .expect(StatusCodes.CREATED);

    await global.__SERVER__
      .patch(endpoint)
      .send({ friendId: requester.id, accept: false })
      .set('authorization', requestee.accessToken)
      .expect(StatusCodes.OK);

    await global.__SERVER__
      .post(endpoint)
      .send({ UserID: requestee.id })
      .set('authorization', requester.accessToken)
      .expect(StatusCodes.BAD_REQUEST);


  });

  it('should be able to accept a friend request', async () => {
    const [requester, requestee] = await global.__getRandUsers(2);

    await global.__SERVER__
      .post(endpoint)
      .send({ UserID: requestee.id })
      .set('authorization', requester.accessToken)
      .expect(StatusCodes.CREATED);


    await global.__SERVER__
      .patch(endpoint)
      .send({ friendId: requester.id, accept: true })
      .set('authorization', requestee.accessToken)
      .expect(StatusCodes.OK);



    const friend = await global.__SEQUELIZE__.query(`
      SELECT * 
      FROM friends 
      WHERE user_one_id = '${requester.id}' AND user_two_id = '${requestee.id}' 
      OR user_one_id = '${requestee.id}' AND user_two_id = '${requester.id}';`);


    expect(friend[1]).toBeDefined();

  });

  it('should not be able to send an friend request if already friends', async () => {
    const [requester, requestee] = await global.__getRandUsers(2);

    await global.__SERVER__
      .post(endpoint)
      .send({ UserID: requestee.id })
      .set('authorization', requester.accessToken)
      .expect(StatusCodes.CREATED);


    await global.__SERVER__
      .patch(endpoint)
      .send({ friendId: requester.id, accept: true })
      .set('authorization', requestee.accessToken)
      .expect(StatusCodes.OK);

    await global.__SERVER__
      .post(endpoint)
      .send({ UserID: requestee.id })
      .set('authorization', requester.accessToken)
      .expect(StatusCodes.BAD_REQUEST);
  });

  it('should be able to remove a friend request sent', async () => {
    const [requester, requestee] = await global.__getRandUsers(2);

    await global.__SERVER__
      .post(endpoint)
      .send({ UserID: requestee.id })
      .set('authorization', requester.accessToken)
      .expect(StatusCodes.CREATED);

    await global.__SERVER__
      .delete(`${endpoint}/?friendId=${requestee.id}`)
      .set('authorization', requester.accessToken)
      .expect(StatusCodes.OK);

  });

});
