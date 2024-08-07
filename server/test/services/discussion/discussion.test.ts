/* eslint-disable import/no-extraneous-dependencies */
import { StatusCodes } from 'http-status-codes';

describe("'discussion ' service", () => {
  let testUsers;
  const server = global.__SERVER__;
  const endpoint = '/discussion';

  beforeAll(async () => {
    testUsers = await global.__getRandUsers(3);
  });
  it('registered the service', () => {
    const service = global.__APP__.service('discussion');
    expect(service).toBeTruthy();
  });

  it('Should create a discussion', async () =>
    server
      .post(endpoint)
      .send({
        title: 'Test Discussion',
        body: 'Test Discussion Body',
      })
      .set('authorization', `Bearer ${testUsers[0].accessToken}`)
      .expect(StatusCodes.CREATED)
  );
  it('should get a discussion', async () => {

    const disc = await server
      .post(endpoint)
      .send({
        title: 'T diss 1',
        body: 'Test Discussion Body 2',
      })
      .set('authorization', `Bearer ${testUsers[0].accessToken}`)
      .expect(StatusCodes.CREATED)

    return server
      .get(`${endpoint}/${disc.body.id}`)
      .set('authorization', `Bearer ${testUsers[0].accessToken}`)
      .expect(StatusCodes.OK)

  });

  it('should get all discussions', async () => {
    await server
      .get(endpoint)
      .set('authorization', testUsers[0].accessToken)
      .expect(StatusCodes.OK)
      .expect((res) => {
        expect(res.body.total).toBeGreaterThan(0);
      });
  });


  it('should update a discussion', async () => {

    const discussion = await server
      .post(endpoint)
      .send({
        title: 'Test Discussion',
        body: 'Test Discussion Body',
      })
      .set('authorization', `Bearer ${testUsers[0].accessToken}`)
      .expect(StatusCodes.CREATED)

    await server
      .patch(`${endpoint}/${discussion.body.id}`)
      .send({ body: 'New Body' })
      .set('authorization', testUsers[0].accessToken)
      .expect(StatusCodes.OK)
  });


  it('Only discussion creator can update a discussion', async () => {

    const discussion = await server
      .post(endpoint)
      .send({
        title: 'Test Discussion',
        body: 'Test Discussion Body',
      })
      .set('authorization', `Bearer ${testUsers[0].accessToken}`)
      .expect(StatusCodes.CREATED)


    await server
      .patch(`${endpoint}/${discussion.body.id}`)
      .send({ title: 'modify' })
      .set('authorization', `Bearer ${testUsers[1].accessToken}`)
      .expect(StatusCodes.BAD_REQUEST)


  });

  it('Only discussion owner can delete a discussion', async () => {
    const discussion = await server
      .post(endpoint)
      .send({
        title: 'Test Discussion',
        body: 'Test Discussion Body',
      })
      .set('authorization', `Bearer ${testUsers[0].accessToken}`)
      .expect(StatusCodes.CREATED)

    return server
      .delete(`${endpoint}/${discussion.body.id}`)
      .set('authorization', testUsers[1].accessToken)
      .expect(StatusCodes.BAD_REQUEST)
  });

  it('should delete a discussion', async () => {

    const discussion = await server
      .post(endpoint)
      .send({
        title: 'Test Discussion',
        body: 'Test Discussion Body',
      })
      .set('authorization', `Bearer ${testUsers[0].accessToken}`)
      .expect(StatusCodes.CREATED)


    return server
      .delete(`${endpoint}/${discussion.body.id}`)
      .set('authorization', testUsers[0].accessToken)
      .expect(StatusCodes.OK)
  });
});


/** */

// it.skip('should create a comment on a discussion', async () => {
//   comment = await server
//     .post(endpoint)
//     .send({
//       title: '',
//       body: 'Well this is a comment',
//       DiscussionId: discussion.id,
//     })
//     .set('authorization', testUsers[1].accessToken);

//   expect(comment.statusCode).toBe(201);
//   comment = comment.body;

//   expect(comment.DiscussionId).toBe(discussion.id);
// });


// it.skip('discussion should show one comment and 1 participant', async () => {
//   const { body: discussionWithComment } = await server
//     .get(`${endpoint}/${discussion.id}`)
//     .set('authorization', testUsers[1].accessToken);

//   expect(discussionWithComment).toMatchObject({
//     id: discussion.id,
//     title: discussion.title,
//     body: discussion.body,
//     User: {
//       id: testUsers[0].id,
//       firstName: testUsers[0].firstName,
//       lastName: testUsers[0].lastName,
//       profilePicture: expect.any(String),
//       createdAt: expect.any(String),
//       updatedAt: expect.any(String),
//     },
//     activeParticipants: 1,
//     amountOfComments: 1,
//     amountOfReactions: 0,
//     lastComment: {
//       id: comment.id,
//       title: comment.title,
//       body: comment.body,
//       createdAt: expect.any(String),
//       updatedAt: expect.any(String),
//       UserId: testUsers[1].id,
//       commenterFirstName: testUsers[1].firstName,
//       commenterLastName: testUsers[1].lastName,
//       commenterProfilePicture: expect.any(String),
//     },
//   });
// });


/**
 * 
 * 
 * 
 * it.skip('Same user should create a comment on a discussion', async () => {
    const { body: comment2 } = await server
      .post(endpoint)
      .send({
        title: '',
        body: 'Well this is a  second comment',
        DiscussionId: discussion.id,
      })
      .set('authorization', testUsers[1].accessToken);

    expect(comment2.DiscussionId).toBe(discussion.id);
  });


   it.skip('discussion should show 2 comment and 1 participant', async () => {
    const { body: discussionWithComment } = await server
      .get(`${endpoint}/${discussion.id}`)
      .set('authorization', testUsers[1].accessToken);

    expect(discussionWithComment).toMatchObject({
      id: discussion.id,
      title: discussion.title,
      body: discussion.body,
      User: {
        id: testUsers[0].id,
        firstName: testUsers[0].firstName,
        lastName: testUsers[0].lastName,
        profilePicture: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
      activeParticipants: 1,
      amountOfComments: 2,
      lastComment: {
        id: comment.id,
        title: comment.title,
        body: comment.body,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        UserId: testUsers[1].id,
        commenterFirstName: testUsers[1].firstName,
        commenterLastName: testUsers[1].lastName,
        commenterProfilePicture: expect.any(String),
      },
    });
  });

  it.skip('Different user should create a comment on a discussion', async () => {
    const { body: comment3 } = await server
      .post(endpoint)
      .send({
        title: '',
        body: 'Well this is a third comment',
        DiscussionId: discussion.id,
      })
      .set('authorization', testUsers[2].accessToken);

    expect(comment3.DiscussionId).toBe(discussion.id);
  });

  it.skip('discussion should show 3 comment and 2 participant and 0 reactions', async () => {
    const { body: discussionWithComment } = await server
      .get(`${endpoint}/${discussion.id}`)
      .set('authorization', testUsers[1].accessToken);

    expect(discussionWithComment).toMatchObject({
      id: discussion.id,
      title: discussion.title,
      body: discussion.body,
      User: {
        id: testUsers[0].id,
        firstName: testUsers[0].firstName,
        lastName: testUsers[0].lastName,
        profilePicture: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
      activeParticipants: 2,
      amountOfComments: 3,
      amountOfReactions: 0,
      lastComment: {
        id: comment.id,
        title: comment.title,
        body: comment.body,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        UserId: testUsers[1].id,
        commenterFirstName: testUsers[1].firstName,
        commenterLastName: testUsers[1].lastName,
        commenterProfilePicture: expect.any(String),
      },
    });
  });
  it.skip('should react on a Discussion', async () => {
    const { statusCode: reactionStatus } = await server
      .post('/reactions')
      .send({
        entityId: discussion.id,
        content: 'like',
        entityType: 'Discussion',
      })
      .set('authorization', testUsers[2].accessToken);

    expect(reactionStatus).toBe(201);
  });

  it.skip('discussion should show 3 comment and 2 participant and 1 reactions but not reactor', async () => {
    const { body: discussionWithCommentAndReaction } = await server
      .get(`${endpoint}/${discussion.id}`)
      .set('authorization', testUsers[1].accessToken);

    expect(discussionWithCommentAndReaction).toMatchObject({
      id: discussion.id,
      title: discussion.title,
      body: discussion.body,
      User: {
        id: testUsers[0].id,
        firstName: testUsers[0].firstName,
        lastName: testUsers[0].lastName,
        profilePicture: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
      activeParticipants: 2,
      amountOfComments: 3,
      amountOfReactions: 1,
      isReactor: null,
      lastComment: {
        id: comment.id,
        title: comment.title,
        body: comment.body,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        UserId: testUsers[1].id,
        commenterFirstName: testUsers[1].firstName,
        commenterLastName: testUsers[1].lastName,
        commenterProfilePicture: expect.any(String),
      },
    });
  });

  it.skip('discussion should show 3 comment and 2 participant and 1 reactions and is reactor', async () => {
    const { body: discussionWithCommentAndReaction } = await server
      .get(`${endpoint}/${discussion.id}`)
      .set('authorization', testUsers[2].accessToken);

    expect(discussionWithCommentAndReaction).toMatchObject({
      id: discussion.id,
      title: discussion.title,
      body: discussion.body,
      User: {
        id: testUsers[0].id,
        firstName: testUsers[0].firstName,
        lastName: testUsers[0].lastName,
        profilePicture: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
      activeParticipants: 2,
      amountOfComments: 3,
      amountOfReactions: 1,
      isReactor: expect.any(Array),
      lastComment: {
        id: comment.id,
        title: comment.title,
        body: comment.body,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        UserId: testUsers[1].id,
        commenterFirstName: testUsers[1].firstName,
        commenterLastName: testUsers[1].lastName,
        commenterProfilePicture: expect.any(String),
      },
    });
  });


    it.skip('should get comments on a discussion', async () => {
    const { body: comments } = await server
      .get(`${endpoint}?DiscussionId=${discussion.id}`)
      .set('authorization', testUsers[0].accessToken);

    comments.data.forEach((com) => {
      expect(com).toMatchObject({
        id: expect.any(String),
        body: expect.any(String),
      });
    });
  });


   it.skip('Cannot comment on a discussion if it is locked', async () => {
    const commentAttempt = await server
      .post(endpoint)
      .send({
        title: '',
        body: 'Commenting on a locked discussion',
        DiscussionId: discussion.id,
      })
      .set('authorization', testUsers[2].accessToken);

    expect(commentAttempt.statusCode).toBe(400);
  });
  **
 */