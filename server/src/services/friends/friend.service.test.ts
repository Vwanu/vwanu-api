/* eslint-disable camelcase */
/* eslint-disable no-undef */
/* eslint-disable import/no-extraneous-dependencies */

import { StatusCodes } from 'http-status-codes';

const endpoint = '/friends';
const friendRequestEndpoint = '/friendRequest';


let User;
let notFriend;
describe('friend service', () => {

  beforeAll(async () => { });
  afterAll(async () => { });

  it('should see all his friends', async () => {

    // create the users
    const [mainUser,  ...users] = await global.__getRandUsers(5);


    // sending post request to the main user
    await Promise.all(
      users.map((user) =>
        global.__SERVER__
          .post(friendRequestEndpoint)
          .send({ UserID: mainUser.id })
          .set('authorization', user.accessToken)
      )
    );
    // Accept all friend request
    const accept = await Promise.all(
      users.map(async (user) =>
        global.__SERVER__
          .post(endpoint)
          .send({ friendId: user.id, accept: true })
          .set('authorization', mainUser.accessToken)
      )
    );


    const myFriendsR = await global.__SERVER__
      .get(endpoint)
      .set('authorization', mainUser.accessToken);

    console.log({ myFriendsR: myFriendsR.body });

    expect(myFriendsR.status).toEqual(StatusCodes.OK);
    expect(Array.isArray(myFriendsR.body.data)).toBe(true);
  

    expect(
      myFriendsR.body.data.every((user) => user.id === notFriend.body.id)
    ).toBe(false);
  });

  it('User should Remove someone as friend', async () => {
    const toUnfriend = Friends[0].body;

    const res = await global.__SERVER__
      .delete(`${endpoint}/?friendId=${toUnfriend.id}`)
      .set('authorization', User.body.accessToken);

    expect(res.body).toEqual(
      expect.objectContaining({
        id: toUnfriend.id,
        lastName: toUnfriend.lastName,
        firstName: toUnfriend.firstName,
        updatedAt: expect.any(String),
        profilePicture: toUnfriend.profilePicture,
      })
    );

    const myFriendsR = await global.__SERVER__
      .get(endpoint)
      .set('authorization', User.body.accessToken);

    myFriendsR.body.data.forEach((friend) => {
      expect(Friends.some((user) => user.body.id === friend.id)).toBe(true);
    });

    expect(
      myFriendsR.body.data.every((user) => user.id === toUnfriend.id)
    ).toBe(false);
  });
  it('Requester should remove someone as friend', async () => {
    const toUnfriend = User.body;
    const requester = createdTestUsers[2].body;

    const res = await global.__SERVER__
      .delete(`${endpoint}/?friendId=${toUnfriend.id}`)
      .set('authorization', requester.accessToken);

    expect(res.body).toEqual(
      expect.objectContaining({
        id: toUnfriend.id,
        lastName: toUnfriend.lastName,
        firstName: toUnfriend.firstName,
        updatedAt: expect.any(String),
        profilePicture: toUnfriend.profilePicture,
      })
    );

    const deleteUser = res.body;
    delete deleteUser.updatedAt;
    expect(toUnfriend).toMatchObject(deleteUser);

    const myFriendsR = await global.__SERVER__
      .get(endpoint)
      .set('authorization', requester.accessToken);

    myFriendsR.body.data.forEach((friend) => {
      if (friend.id !== requester.id)
        expect(Friends.some((user) => user.body.id === friend.id)).toBe(true);
    });
  });
});
