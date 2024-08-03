import { StatusCodes } from 'http-status-codes';
import { getRandUser } from '../../src/lib/utils/generateFakeUser';

const endpoint = '/users';


describe('/users service', () => {

  const server = global.__SERVER__;

  afterAll(async () => {
    await global
      .__APP__
      .get('sequelizeClient')
      .models
      .User
      .destroy({ where: {} });
  }
  );
  it('The user service is running', async () => {
    const service = global.__APP__.service('users');
    expect(service).toBeDefined();
  });

  it('Should validate and not create users', async () => {

    await server
      .post(endpoint)
      .send({ password: 'goodPassword' })
      .expect(StatusCodes.BAD_REQUEST);

    await server
      .post(endpoint)
      .send({ email: 'notEmail', password: 'goodPassword' })
      .expect(StatusCodes.BAD_REQUEST);

    await server
      .post(endpoint)
      .send({ email: 'goodEmail', password: 'short' })
      .expect(StatusCodes.BAD_REQUEST);



  }, 10000);

  it('Should create users', async () => {

    await server
      .post(endpoint)
      .send({ ...getRandUser(), id: undefined })
      .expect(StatusCodes.CREATED);
  });


  it('Should see all profiles', async () => {
    await global
      .__APP__
      .get('sequelizeClient')
      .models
      .User
      .destroy({ where: {} });

    const users = await global.__getRandUsers(5);

    const res = await server
      .get(endpoint)
      .set('authorization', `${users[0].accessToken}`)
      .expect(StatusCodes.OK);
    expect(res.body.total).toBe(users.length);

  }, 5000);

  it('should create a user with a private profile', async () => {
    const u = getRandUser();
    const user = u;
    delete user.id;
    const testUser = await server
      .post(endpoint)
      .send({ ...user, profilePrivacy: 'private' })
      .expect(StatusCodes.CREATED);

    expect(testUser.body.profilePrivacy).toBe('private');
  });
  it('should not see the private profile user', async () => {

    await global
      .__APP__
      .get('sequelizeClient')
      .models
      .User
      .destroy({ where: {} });

    const users = await global.__getRandUsers(5);

    let res = await server
      .get(endpoint)
      .set('authorization', `${users[0].accessToken}`)
      .expect(StatusCodes.OK);
    expect(res.body.total).toBe(users.length);


    const u = getRandUser();
    const user = u;
    delete user.id;

    await server
      .post(endpoint)
      .send({ ...user, profilePrivacy: 'private' })
      .expect(StatusCodes.CREATED);

    res = await server
      .get(endpoint)
      .set('authorization', `${users[0].accessToken}`)
      .expect(StatusCodes.OK);
    expect(res.body.total).toBe(users.length);

  }, 10000);


  it('should get a user by id ', async () => {

    const [requester, user] = await global.__getRandUsers(2);

    await server
      .get(`${endpoint}/${user.id}`)
      .set('authorization', requester.accessToken)
      .expect(StatusCodes.OK);
  });
  it('should not update sensitive information', async () => {
    const user = (await global.__getRandUsers())[0];

    await server
      .patch(`${endpoint}/${user.id}`)
      .send({ password: 'password' })
      .set('authorization', user.accessToken)
      .expect(StatusCodes.BAD_REQUEST);

    await server
      .patch(`${endpoint}/${user.id}`)
      .send({ activationKey: 'activationKey' })
      .set('authorization', user.accessToken)
      .expect(StatusCodes.BAD_REQUEST);

    await server
      .patch(`${endpoint}/${user.id}`)
      .send({ resetPasswordKey: 'resetPasswordKey' })
      .set('authorization', user.accessToken)
      .expect(StatusCodes.BAD_REQUEST);

  });

  it('should not modify a different user', async () => {
    const [user1, user2] = await global.__getRandUsers(2);
    await server
      .patch(`${endpoint}/${user1.id}`)
      .send({ firstName: 'newName' })
      .set('authorization', user2.accessToken)
      .expect(StatusCodes.BAD_REQUEST);
  });

  it('should update the user details', async () => {
    const user = (await global.__getRandUsers())[0];
    const modifications = { firstName: 'newName', lastName: 'newLastName' };
    const res = await server
      .patch(`${endpoint}/${user.id}`)
      .send(modifications)
      .set('authorization', user.accessToken)
      .expect(StatusCodes.OK);

    expect(res.body).toEqual(expect.objectContaining(modifications));
  });


  it('should not delete another user profile', async () => {
    const [user1, user2] = await global.__getRandUsers(2);
    await server
      .delete(`${endpoint}/${user1.id}`)
      .set('authorization', user2.accessToken)
      .expect(StatusCodes.BAD_REQUEST);
  });

  it('should delete his own profile', async () => {
    const user = (await global.__getRandUsers())[0];
    await server
      .delete(`${endpoint}/${user.id}`)
      .set('authorization', user.accessToken)
      .expect(StatusCodes.OK);
  });
});


// it.skip('should only find online users witch are friends and mark as friends', async () => {
//   const {
//     body: { data: users },
//   } = await server
//     .get(`${endpoint}?online=true&friends=true`)
//     .set('authorization', `${observer.body.accessToken}`);

//   expect(users).toHaveLength(0);

//   // Creating 4 future friend for the observer
//   const responses = await Promise.all(
//     getRandUsers(4).map((u) => {
//       const user = { ...u, online: true };
//       delete user.id;
//       return server.post(endpoint).send(user);
//     })
//   );

//   responses.forEach(({ statusCode }) => {
//     expect(statusCode).toBe(201);
//   });

//   // Make theme friends with the observer
//   const { User_friends: friends } = global.__APP__.get('sequelizeClient').models;
//   await Promise.all(
//     responses.map(({ body }) =>
//       friends.create({ UserId: body.id, friendId: observer.body.id })
//     )
//   );

//   const {
//     body: { data: onlineUsers },
//   } = await server
//     .get(`${endpoint}?online=true&friends=true`)
//     .set('authorization', `${observer.body.accessToken}`);

//   onlineUsers.forEach((user) => {
//     expect(user.isFriend).toBe(true);
//   });
//   expect(onlineUsers).toHaveLength(4);
// });

// it.skip('should create user and associate them with their interest', async () => {
//   const responses = await Promise.all(
//     getRandUsers(2).map((u) => {
//       const user = u;
//       delete user.id;
//       return server.post(endpoint).send({ ...user, interests });
//     })
//   );

//   observer = responses[0].body;
//   responses.forEach(({ statusCode }) => {
//     expect(statusCode).toBe(201);
//   });
// });

// it.skip('should pull users with interest', async () => {
//   const {
//     body: { data: usersWithInterest },
//   } = await server
//     .get(endpoint)
//     .set('authorization', observer.accessToken);

//   expect(usersWithInterest.some((user) => user.Interests?.length > 0)).toBe(
//     true
//   );

//   usersWithInterest.forEach((user) => {
//     if (Array.isArray(user.Interests)) {
//       expect(
//         user.Interests.map((interest) => interest.name).includes(interests[0])
//       ).toBe(true);

//       expect(
//         user.Interests.map((interest) => interest.name).includes(interests[1])
//       ).toBe(true);
//     }
//   });
// });
// it.skip('should pull a single user with interest', async () => {
//   const { body: observerWithInterest } = await server
//     .get(`${endpoint}/${observer.id}`)
//     .set('authorization', observer.accessToken);
//   const { Interests } = observerWithInterest;
//   expect(Array.isArray(Interests)).toBe(true);
//   expect(Interests).toHaveLength(2);

//   expect(
//     Interests.map((interest) => interest.name).includes(interests[0])
//   ).toBe(true);

//   expect(
//     Interests.map((interest) => interest.name).includes(interests[1])
//   ).toBe(true);
// });

// it.skip('Should create user and associate interest on patch', async () => {
//   const responses = await Promise.all(
//     getRandUsers(2).map((u) => {
//       const user = u;
//       delete user.id;
//       return server.post(endpoint).send({ ...user });
//     })
//   );

//   observer = responses[0].body;
//   responses.forEach(({ statusCode }) => {
//     expect(statusCode).toBe(201);
//   });
//   // pull and the user and test it has no interests

//   const { body: userWithNoInterests } = await server
//     .get(`${endpoint}/${observer.id}`)
//     .set('authorization', observer.accessToken);
//   expect(userWithNoInterests.Interests).toBeNull();

//   // patch the user with interests
//   await server
//     .patch(`${endpoint}/${observer.id}`)
//     .send({ interests })
//     .set('authorization', observer.accessToken);
//   // pull and test user now has interest false
//   const { body: userWitInterests } = await server
//     .get(`${endpoint}/${observer.id}`)
//     .set('authorization', observer.accessToken);

//   expect(Array.isArray(userWitInterests.Interests)).toBe(true);
//   expect(userWitInterests.Interests).toHaveLength(interests.length);
// }, 30000);