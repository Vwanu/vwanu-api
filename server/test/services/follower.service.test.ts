/* eslint-disable camelcase */
/* eslint-disable no-undef */
/* eslint-disable import/no-extraneous-dependencies */
import { StatusCodes } from 'http-status-codes';


const endpoint = '/followers';



describe('Follower service, ', () => {
  beforeAll(async () => { });
  afterAll(async () => { });

  it('The follower service is running', async () => {
    const service = global.__APP__.service('followers');
    expect(service).toBeDefined();
  });

  it('should start following someone', async () => {
    const [requester, user] = await global.__getRandUsers(2);
    return global.__SERVER__
      .post(`${endpoint}`)
      .send({ UserId: user.id })
      .set('Authorization', `Bearer ${requester.accessToken}`)
      .expect(StatusCodes.CREATED)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            user_id: user.id,
            follower_id: requester.id,
          })
        );
      });
  });
  it('should stop following someone', async () => {

    const [requester, user] = await global.__getRandUsers(2);

    await global.__SERVER__
      .post(`${endpoint}`)
      .send({ UserId: user.id })
      .set('Authorization', `Bearer ${requester.accessToken}`)
      .expect(StatusCodes.CREATED);


    await global.__SERVER__
      .delete(`${endpoint}/${user.id}`)
      .set('Authorization', `Bearer ${requester.accessToken}`)
      .expect(StatusCodes.OK);




  });

  it('get the list of all his followers', async () => {
    const [popular, ...users] = await global.__getRandUsers(4);
    await Promise.all(users.map(async (user) => {
      global.__SERVER__
        .post(`${endpoint}`)
        .send({ UserId: popular.id })
        .set('Authorization', `Bearer ${user.accessToken}`)
    }
    ));

    const response = await global.__SERVER__
      .get(`${endpoint}/?action=people-who-follow-me`)
      .set('Authorization', `Bearer ${popular.accessToken}`)
    // .expect(StatusCodes.OK);

    console.log(response.body);



    // expect(f).toMatchObject({
    //   id: expect.any(String),
    //   firstName: expect.any(String),
    //   lastName: expect.any(String),
    //   profilePicture: expect.any(String),
    // });
    // });
  }, 2000);
  it('get a list of all the people he is following', async () => {

    const [requester, ...users] = await global.__getRandUsers(3);


    await Promise.all(users.map(async (user) => {

      global.__SERVER__
        .post(`${endpoint}`)
        .send({ UserId: user.id })
        .set('Authorization', `Bearer ${requester.accessToken}`)
        .expect(StatusCodes.CREATED);
    }));

    global.__SERVER__
      .get(endpoint)
      .set('Authorization', `Bearer ${requester.accessToken}`)
      .expect(StatusCodes.OK);

    // expect(f).toMatchObject({
    //   id: expect.any(String),
    //   firstName: expect.any(String),
    //   lastName: expect.any(String),
    //   profilePicture: expect.any(String),
    // });
  });
  it('should get a list of people someone else is following', async () => {

    const [popular, viewer, ...users] = await global.__getRandUsers(4);

    await Promise.all(users.map(async (user) => {
      global.__SERVER__
        .post(`${endpoint}`)
        .send({ UserId: popular.id })
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(StatusCodes.CREATED);
    }));


    await global.__SERVER__
      .get(`${endpoint}?action=people-who-follow-me&UserId=${popular.id}`)
      .set('Authorization', `Bearer ${viewer.accessToken}`)
      .expect(StatusCodes.OK);




    // response.body.data.forEach((follower) => {
    //   expect(follower).toMatchObject({
    //     id: expect.any(String),
    //     firstName: expect.any(String),
    //     lastName: expect.any(String),
    //     profilePicture: expect.any(String),
    //   });
    // });
  })
});

