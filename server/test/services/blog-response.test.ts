import { StatusCodes } from 'http-status-codes';

describe("Blog response service.", () => {
  const testServer = global.__SERVER__;
  let testUsers;
  let blog;
  let blogCreator;
  const blogEndpoint = '/blogs';
  const endpoint = '/blogResponse';

  beforeAll(async () => {
    [blogCreator, ...testUsers] = await global.__getRandUsers(3);
    blog = await testServer
      .post(blogEndpoint)
      .send({
        blogTitle: Math.random().toString(36).substring(7),
        blogText: `<strong>${Math.random().toString(36).substring(20)}</strong><img src=x/>`
      })
      .set('authorization', blogCreator.accessToken);

    blog = blog.body;
  }, 100000);

  it('registered the service', () => {
    const service = global.__APP__.service('blogResponse');
    expect(service).toBeTruthy();
  });

  it('any user can create a response on a blog', async () => {
    const responseText = Math.random().toString(36).substring(20);
    return testServer
      .post(endpoint)
      .send({
        BlogId: blog.id,
        responseText,
      })
      .set('authorization', testUsers[0].accessToken)
      .expect(StatusCodes.CREATED)
      .expect(r => {
        expect(r.body).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            responseText,
            UserId: testUsers[0].id,
          })
        )
      });
  });


  it('Only a response creator can edit a response', async () => {
    const responseText = Math.random().toString(36).substring(20);
    const reponder = testUsers[0];

    const bR = await testServer
      .post(endpoint)
      .send({ BlogId: blog.id, responseText })
      .set('authorization', reponder.accessToken)
      .expect(StatusCodes.CREATED)


    await testServer
      .patch(`${endpoint}/${bR.body.id}`)
      .send({ responseText, })
      .set('authorization', reponder.accessToken)
      .expect(StatusCodes.OK);

    await testServer
      .patch(`${endpoint}/${bR.body.id}`)
      .send({ responseText, })
      .set('authorization', blogCreator.accessToken)
      .expect(StatusCodes.BAD_REQUEST);
  });

  it('User fetch all response base on blog id', async () => {
    const user0 = testUsers[0];
    return testServer
      .get(`${endpoint}?BlogId=${blog.id}`)
      .set('authorization', user0.accessToken)
      .expect(StatusCodes.OK)
      .expect(responses => {
        expect(responses.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              responseText: expect.any(String),
              User: expect.objectContaining({
                firstName: expect.any(String),
                lastName: expect.any(String),
                id: expect.any(String),
                profilePicture: expect.any(String),
              }),
            }),
          ])
        );
      });


  });

  it('Only a response creator can delete a response', async () => {

    const responseText = Math.random().toString(36).substring(20);
    const reponder = testUsers[0];

    const bR = await testServer
      .post(endpoint)
      .send({ BlogId: blog.id, responseText })
      .set('authorization', reponder.accessToken)
      .expect(StatusCodes.CREATED)

    await testServer
      .delete(`${endpoint}/${bR.body.id}`)
      .set('authorization', blogCreator.accessToken)
      .expect(StatusCodes.BAD_REQUEST)

    await testServer
      .delete(`${endpoint}/${bR.body.id}`)
      .set('authorization', reponder.accessToken)
      .expect(StatusCodes.OK);
  });
});
