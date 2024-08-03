import { StatusCodes } from 'http-status-codes';

describe('Friend service, ', () => {
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
    // .expect(StatusCodes.OK);

    console.log(response.body);
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

    console.log(response2.body);

    expect(response2.body.total).toEqual(1);

    // expect(response.body.data).toEqual(
    //   expect.arrayContaining([
    //     expect.objectContaining({
    //       firstName: requestee.firstName,
    //       lastName: requestee.lastName,
    //       id: requestee.id,
    //       profilePicture: expect.any(String),
    //     }),
    //   ])
    // );

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



  it('should be able to see all friend request receive', async () => {
    const [requester, requestee] = await global.__getRandUsers(2);

    const response = await global.__SERVER__
      .get(`${endpoint}/?action=people-who-want-to-Be-my-friend`)
      .set('authorization', requestee.accessToken);

    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          firstName: requester.firstName,
          lastName: requester.lastName,
          id: requester.id,
          profilePicture: expect.any(String),
        }),
      ])
    );
    expect(response.status).toBe(StatusCodes.OK);
  });

  it.skip('should be able to accept a friend request', async () => {
    const [requester, requestee] = await global.__getRandUsers(2);

    const response = await global.__SERVER__
      .patch(endpoint)
      .send({ friendId: requester.id, accept: true })
      .set('authorization', requestee.accessToken);

    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: requester.id,
        firstName: requester.firstName,
        lastName: requester.lastName,
        createdAt: expect.any(String),
      })
    );
  });
  it.skip('should not be able to send an friend request if already friends', async () => {
    const [requester, requestee] = await global.__getRandUsers(2);

    const response = await global.__SERVER__
      .post(endpoint)
      .send({ UserID: requestee.id })
      .set('authorization', requester.accessToken);

    expect(response.body).toEqual({
      name: 'BadRequest',
      message: expect.stringContaining(' previous '),
      code: 400,
      className: 'bad-request',
      errors: expect.any(Object),
    });
    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });
  it.skip('should be able to remove a friend request sent', async () => {
    const [requester, requestee] = await global.__getRandUsers(2);
    const response = await global.__SERVER__
      .post(endpoint)
      .send({ UserID: requestee.id })
      .set('authorization', requester.accessToken);

    expect(response.status).toEqual(StatusCodes.CREATED);

    // expect(response.body).toEqual(
    //   expect.objectContaining({
    //     id: expect.any(String),
    //     firstName: expect.any(String),
    //     lastName: expect.any(String),
    //     updatedAt: expect.any(String),
    //     createdAt: expect.any(String),
    //   })
    // );

    // Making the remove friend request .
    const removeRes = await global.__SERVER__
      .delete(`${endpoint}/?friendId=${requestee.id}`)
      .set('authorization', requester.accessToken);

    expect(removeRes.statusCode).toEqual(200);
    // expect(removeRes.body).toEqual(
    //   expect.objectContaining({
    //     createdAt: expect.any(String),
    //     firstName: expect.any(String),
    //     lastName: expect.any(String),
    //     updatedAt: expect.any(String),
    //     id: expect.any(Number),
    //     profilePicture: expect.objectContaining({
    //       medium: expect.any(String),
    //       original: expect.any(String),
    //       small: expect.any(String),
    //       tiny: expect.any(String),
    //     }),
    //   })
    // );
  });



  it.skip('should be able to see amount of friend request sent ', async () => {
    const [requester, ...requestees] = await global.__getRandUsers(3);

    global.__SERVER__
      .post(endpoint)
      .send({ UserID: requestees[0].id })
      .set('authorization', requester.accessToken)
      .expect(StatusCodes.CREATED);

    // test here the amount of friend request sent is one. 

    global.__SERVER__
      .post(endpoint)
      .send({ UserID: requestees[1].id })
      .set('authorization', requester.accessToken)
      .expect(StatusCodes.CREATED);

    // test here the amount of friend request sent is two. 



  });
});
