/* eslint-disable camelcase */
/* eslint-disable no-undef */
/* eslint-disable import/no-extraneous-dependencies */

import { StatusCodes } from 'http-status-codes';

const endpoint = '/friends';
const friendRequestEndpoint = '/friendRequest';


describe('friend service', () => {

  beforeAll(async () => { });
  afterAll(async () => { });

  it('should see all his friends', async () => {

    const [mainUser, ...users] = await global.__getRandUsers(5);
    await Promise.all(
      users.map((user) =>
        global.__SERVER__
          .post(friendRequestEndpoint)
          .send({ UserID: mainUser.id })
          .set('authorization', user.accessToken)

      )
    );
    // Accept all friend request
    await Promise.all(
      users.map(async (user) =>
        global.__SERVER__
          .patch(friendRequestEndpoint)
          .send({ friendId: user.id, accept: true })
          .set('authorization', mainUser.accessToken)

      )
    );

    global.__SERVER__
      .get(endpoint)
      .set('authorization', mainUser.accessToken)
      .expect(StatusCodes.OK)
      .expect(({ body }) => {
        expect(body.total).toEqual(users.length);
      });

    // any other user should have one friend 
    global.__SERVER__
      .get(endpoint)
      .set('authorization', users[0].accessToken)
      .expect(StatusCodes.OK)
      .expect(({ body }) => {
        expect(body.total).toEqual(1);
      });


  });

  it('User should Remove someone as friend', async () => {

    const users = await global.__getRandUsers(3);
    const mainUser = users.shift();
    const [toUnfriend] = users;

    await Promise.all(
      users.map((user) =>
        global.__SERVER__
          .post(friendRequestEndpoint)
          .send({ UserID: mainUser.id })
          .set('authorization', user.accessToken)

      )
    );
    // Accept all friend request
    await Promise.all(
      users.map(async (user) =>
        global.__SERVER__
          .patch(friendRequestEndpoint)
          .send({ friendId: user.id, accept: true })
          .set('authorization', mainUser.accessToken)

      )
    );


    global.__SERVER__
      .delete(`${endpoint}/?friendId=${toUnfriend.id}`)
      .set('authorization', mainUser.accessToken)
      .expect(StatusCodes.OK)


    global.__SERVER__
      .get(endpoint)
      .set('authorization', mainUser.accessToken)
      .expect(StatusCodes.OK)
      .expect(({ body }) => {
        expect(body.total).toEqual(users.length - 1);
      });
  });
  it('Requester should remove someone as friend', async () => {

    const users = await global.__getRandUsers(3);
    const mainUser = users.shift();
    const [toUnfriend] = users;

    await Promise.all(
      users.map((user) =>
        global.__SERVER__
          .post(friendRequestEndpoint)
          .send({ UserID: mainUser.id })
          .set('authorization', user.accessToken)

      )
    );
    // Accept all friend request
    await Promise.all(
      users.map(async (user) =>
        global.__SERVER__
          .patch(friendRequestEndpoint)
          .send({ friendId: user.id, accept: true })
          .set('authorization', mainUser.accessToken)

      )
    );


    global.__SERVER__
      .delete(`${endpoint}/?friendId=${mainUser.id}`)
      .set('authorization', toUnfriend.accessToken)
      .expect(StatusCodes.OK)




  });
});
