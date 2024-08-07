/* eslint-disable import/no-extraneous-dependencies */
import { StatusCodes } from 'http-status-codes';
import slugify from '../../src/lib/utils/slugify';
import sanitizeHtml from '../../src/lib/utils/sanitizeHtml';


describe(" Blog service service", () => {
  const endpoint = '/blogs';

  it('registered the service', () => {
    const service = global.__APP__.service('blogs');
    expect(service).toBeTruthy();
  });

  it('should be able to create new blogs', async () => {
    const [user] = await global.__getRandUsers(1)
    return global.__SERVER__
      .post(endpoint)
      .send({
        blogTitle: 'Title ewr',
        blogText: 'Text'
      })
      .set('authorization', user.accessToken)
      .expect(StatusCodes.CREATED)
      .expect((response) => {
        expect(response.body).toMatchObject({
          slug: slugify('Title ewr'),
          amountOfLikes: 0,
          amountOfComments: 0,
        });
      });

  });

  it('should be able to edit his blogs', async () => {
    const [user] = await global.__getRandUsers(1)

    const firstBlogs = await global.__SERVER__
      .post(endpoint)
      .send({
        blogTitle: 'Title ewr',
        blogText: 'Text',
      })
      .set('authorization', user.accessToken)
      .expect(StatusCodes.CREATED);


    const modifications = {
      blogTitle: 'Better Title',
      blogText: 'Bigger Body, text'
    };

    await global.__SERVER__
      .patch(`${endpoint}/${firstBlogs.body.id}`)
      .send(modifications)
      .set('authorization', user.accessToken)
      .expect(StatusCodes.OK)
      .expect((response) => {
        expect(response.body).toMatchObject({
          blogText: sanitizeHtml(modifications.blogText),
          blogTitle: sanitizeHtml(modifications.blogTitle),
          id: firstBlogs.body.id,
        });
      });

  });
  it('should be able to delete his own blog', async () => {
    const [user] = await global.__getRandUsers(1)

    const blog = await global.__SERVER__
      .post(endpoint)
      .send({
        blogTitle: 'Title ewr',
        blogText: 'Text',
      })
      .set('authorization', user.accessToken)
      .expect(StatusCodes.CREATED);

    await global.__SERVER__
      .delete(`${endpoint}/${blog.body.id}`)
      .set('authorization', user.accessToken)
      .expect(StatusCodes.OK);

  });
  it('should not be able to edit some1 else blog', async () => {
    const [user1, user2] = await global.__getRandUsers(2)
    const blog1 = await global.__SERVER__
      .post(endpoint)
      .send({
        blogTitle: 'Better Title',
        blogText: 'Bigger Body, text',
        categories: ' more,some, category',
      })
      .set('authorization', user1.accessToken)
      .expect(StatusCodes.CREATED);

    return global.__SERVER__
      .patch(`${endpoint}/${blog1.body.id}`)
      .send({ blogTitle: 'Way Better Title' })
      .set('authorization', user2.accessToken)
      .expect(StatusCodes.BAD_REQUEST)
      .expect((res) => {
        expect(res.body.message).toEqual(
          expect.stringContaining('Not authorized'))
      }
      );
  });
  it('should not be able to delete some1 else blog', async () => {
    const [user1, user2] = await global.__getRandUsers(2)
    const blog1 = await global.__SERVER__
      .post(endpoint)
      .send({
        blogTitle: 'Better Title',
        blogText: 'Bigger Body, text'
      })
      .set('authorization', user1.accessToken)
      .expect(StatusCodes.CREATED);

    await global.__SERVER__
      .delete(`${endpoint}/${blog1.body.id}`)
      .send({ blogTitle: 'Way Better Title' })
      .set('authorization', user2.accessToken)
      .expect(StatusCodes.BAD_REQUEST)
      .expect((res) => {
        expect(res.body.message).toEqual(
          expect.stringContaining('Not authorized'))
      }
      );


  });

  it('should only show  publish blogs unless owner', async () => {

    const [blogger, reader] = await global.__getRandUsers(2)

    const blog = await global.__SERVER__
      .post(endpoint)
      .send({
        publish: false,
        blogTitle: 'Private Title 1',
        blogText: 'Bigger Body, text ',
      })
      .set('authorization', blogger.accessToken)
      .expect(StatusCodes.CREATED);

    await global.__SERVER__
      .get(`${endpoint}/${blog.body.id}`)
      .set('authorization', blogger.accessToken)
      .expect(StatusCodes.OK)


    await global.__SERVER__
      .get(`${endpoint}/${blog.body.id}`)
      .set('authorization', reader.accessToken)
      .expect(StatusCodes.NOT_FOUND)


  });

  it('owner should see both his private and public blogs', async () => {
    const [blogger] = await global.__getRandUsers(1)

    await global.__SERVER__
      .post(endpoint)
      .send({
        publish: false,
        blogTitle: 'Private Title 1',
        blogText: 'Bigger Body, text ',
      })
      .set('authorization', blogger.accessToken)
      .expect(StatusCodes.CREATED);

    await global.__SERVER__
      .post(endpoint)
      .send({
        publish: true,
        blogTitle: 'Private Title 1',
        blogText: 'Bigger Body, text ',
      })
      .set('authorization', blogger.accessToken)
      .expect(StatusCodes.CREATED);

    await global.__SERVER__
      .get(`${endpoint}?UserId=${blogger.id}`)
      .set('authorization', blogger.accessToken)
      .expect(StatusCodes.OK)
      .expect((res) => {
        expect(res.body.data.length).toBe(2);
      });
  });

});


/** Interests */


/** */
// it('should return show no interest in the previous blogs', async () => {
//   const reader = testUsers[0].body;
//   const {
//     body: { data: publicBlogs },
//   } = await testServer.get(endpoint).set('authorization', reader.accessToken);

//   publicBlogs.forEach((blog) => {
//     expect(blog.Interests).toBe(null);
//   });
// });

// it('should see a list of interest in each blog', async () => {
//   const reader = testUsers[0].body;
//   const blogger = testUsers[1].body;
//   const interest = ['some', 'category'];

//   let newBlogs = await Promise.all(
//     [1, 2, 3].map((i) =>
//       testServer
//         .post(endpoint)
//         .send({
//           interests: interest,
//           blogTitle: `Private Title ${i} from ${blogger.id}`,
//           blogText: 'Bigger Body, text ',
//           publish: true,
//         })
//         .set('authorization', blogger.accessToken)
//     )
//   );
//   newBlogs = newBlogs.map((blog) => blog.body);

//   expect(
//     newBlogs.every((blog) => Array.isArray(blog.Interests))
//   ).toBeTruthy();

//   const {
//     body: { data: publicBlogs },
//   } = await testServer.get(endpoint).set('authorization', reader.accessToken);

//   expect(
//     publicBlogs.some((blog) => Array.isArray(blog.Interests))
//   ).toBeTruthy();
// });

// it('should show null for lastResponse', async () => {
//   const reader = testUsers[0].body;
//   const {
//     body: { data: publicBlogs },
//   } = await testServer.get(endpoint).set('authorization', reader.accessToken);

//   publicBlogs.forEach((blog) => {
//     expect(blog.lastResponse).toBe(null);
//     expect(blog.lastResponse).toBe(null);
//   });
// });
// it('should return 0 comment and 0 reaction ', async () => {
//   const reader = testUsers[0].body;
//   const {
//     body: { data: publicBlogs },
//   } = await testServer.get(endpoint).set('authorization', reader.accessToken);

//   publicBlogs.forEach((blog) => {
//     expect(blog.amountOfComments).toBe(0);
//     expect(blog.amountOfReactions).toBe(0);
//   });
// });

// it('should not be a responder or reactor', async () => {
//   const reader = testUsers[0].body;
//   const {
//     body: { data: publicBlogs },
//   } = await testServer.get(endpoint).set('authorization', reader.accessToken);

//   publicBlogs.forEach((blog) => {
//     expect(blog.isAReactor).toBe(false);
//     expect(blog.isAResponder).toBe(false);
//   });
// });
