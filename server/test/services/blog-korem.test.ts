import { StatusCodes } from 'http-status-codes';

describe("'BlogKorem' service", () => {
  let testServer;
  let testUsers;
  let blogs;
  const endpoint = '/blogs';
  const blogKoremEndpoint = '/blogKorem';



  it('registered the service', () => {
    const service = global.__APP__.service('blogKorem');
    expect(service).toBeTruthy();
  });

  it('Should be able to 👊🏿 a blog', async () => {

    const [user] = await global.__getRandUsers(1);

    const blog = await global.__SERVER__
      .post(endpoint)
      .send({
        blogTitle: 'Title ewr',
        blogText: 'Text'
      })
      .set('authorization', user.accessToken)
      .expect(StatusCodes.CREATED);



    const Korem = await global.__SERVER__
      .post(blogKoremEndpoint)
      .send({ entityId: blog.body.id, time: 1 })
      .set('authorization', user.accessToken);

    console.log('\n\n\n *** Korm *** \n\n\n', Korem.body);


    expect(Korem.body).toMatchObject({
      User: {
        firstName: user.firstName,
        lastName: user.lastName,
        id: user.id,
        profilePicture: {
          tiny: expect.any(String),
          medium: expect.any(String),
          small: expect.any(String),
          original: expect.any(String),
        },
        createdAt: expect.any(String),
      },
      entityId: blog.id,
      createdAt: expect.any(String),
      created: true, // note here it is created
    });
  });

  it('Like will be removed if made on the same post a second time', async () => {
    const blog = blogs[0];
    const user = testUsers[0];
    const Korem = await testServer
      .post(blogKoremEndpoint)
      .send({ entityId: blog.id, time: 1 })
      .set('authorization', user.accessToken);

    expect(Korem.body).toMatchObject({
      User: {
        firstName: user.firstName,
        lastName: user.lastName,
        id: user.id,
        profilePicture: {
          tiny: expect.any(String),
          medium: expect.any(String),
          small: expect.any(String),
          original: expect.any(String),
        },
        createdAt: expect.any(String),
      },
      entityId: blog.id,
      createdAt: expect.any(String),
      created: false, // note here it is not created
    });
  });
});
