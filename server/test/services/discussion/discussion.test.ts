/* eslint-disable import/no-extraneous-dependencies */
import { StatusCodes } from 'http-status-codes';
describe("'discussion ' service", () => {
  let testUsers;
  const server = global.__SERVER__;
  let discussion;
  let comment;
  const endpoint = '/discussion';

  beforeAll(async () => {
    testUsers = await global.__getRandUsers(3);


  });
  it('registered the service', () => {
    const service = global.__APP__.service('discussion');
    expect(service).toBeTruthy();
  });

  it('Should create a discussion', async () => {
    discussion = await server
      .post(endpoint)
      .send({
        title: 'Test Discussion',
        body: 'Test Discussion Body',
      })
      .set('authorization', `Bearer ${testUsers[0].accessToken}`)
      .expect(StatusCodes.CREATED);

  });
  it.skip('should get a discussion', async () => {
    const { body: fetched } = await server
      .get(`${endpoint}/${discussion.id}`)
      .set('authorization', `Bearer ${testUsers[0].accessToken}`);

    expect(fetched).toMatchObject({
      id: discussion.id,
      title: discussion.title,
      body: discussion.body,
      activeParticipants: 0,
      amountOfComments: 0,
      amountOfReactions: 0,
      lastComment: null,
      User: {
        firstName: testUsers[0].firstName,
        lastName: testUsers[0].lastName,
        id: discussion.UserId,
        profilePicture: expect.any(String),
        createdAt: expect.any(String),
      },
    });
  });
  it.skip('should create a comment on a discussion', async () => {
    comment = await server
      .post(endpoint)
      .send({
        title: '',
        body: 'Well this is a comment',
        DiscussionId: discussion.id,
      })
      .set('authorization', testUsers[1].accessToken);

    expect(comment.statusCode).toBe(201);
    comment = comment.body;

    expect(comment.DiscussionId).toBe(discussion.id);
  });

  it.skip('discussion should show one comment and 1 participant', async () => {
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
      amountOfComments: 1,
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

  it.skip('Same user should create a comment on a discussion', async () => {
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

  it.skip('should get all first 50 discussion', async () => {
    const { body: discussionsList } = await server
      .get(endpoint)
      .set('authorization', testUsers[0].accessToken);

    expect(discussionsList.data).toHaveLength(1);
    expect(discussionsList.data[0].id).toEqual(discussion.id);
  });
  it.skip('Should create a second discussion', async () => {
    const { body: discussion2 } = await server
      .post(endpoint)
      .send({
        title: 'Test Discussion',
        body: 'Test Discussion Body',
      })
      .set('authorization', `Bearer ${testUsers[0].accessToken}`);

    expect(discussion2).toHaveProperty('id');
  });

  it.skip('should get all first 50 discussion 2 this time', async () => {
    const { body: discussionsList } = await server
      .get(endpoint)
      .set('authorization', testUsers[0].accessToken);
    expect(discussionsList.data).toHaveLength(2);
    discussionsList.data.forEach((dis) => {
      expect(dis).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        body: expect.any(String),
        User: {
          id: expect.any(String),
          firstName: expect.any(String),
          lastName: expect.any(String),
          profilePicture: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
        activeParticipants: expect.any(Number),
        amountOfComments: expect.any(Number),
        lastComment: expect.any(Object),
      });
      if (dis.id === discussion.id) {
        expect(dis.activeParticipants).toEqual(2);
        expect(dis.amountOfComments).toEqual(3);
      } else {
        expect(dis.activeParticipants).toEqual(0);
        expect(dis.amountOfComments).toEqual(0);
      }
    });
  });
  it.skip('should update a discussion', async () => {
    const { body: updatedDis } = await server
      .patch(`${endpoint}/${discussion.id}`)
      .send({ body: 'New Body' })
      .set('authorization', testUsers[0].accessToken);

    expect(updatedDis.body).toEqual(expect.stringContaining('Body'));
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

  it.skip('Only discussion creator can update a discussion', async () => {
    const response = await server
      .patch(`${endpoint}/${discussion.id}`)
      .send({
        title: 'Attempt to modify',
        body: 'Test Discussion Body',
      })
      .set('authorization', `Bearer ${testUsers[1].accessToken}`);
    expect(response.statusCode).toBe(400);
  });

  it.skip('should lock discussion', async () => {
    const { body: lockedDiscussion } = await server
      .patch(`${endpoint}/${discussion.id}`)
      .send({ locked: true })
      .set('authorization', testUsers[0].accessToken);
    expect(lockedDiscussion.locked).toBe(true);
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

  it.skip('Only discussion owner can delete a discussion', async () => {
    const response = await server
      .delete(`${endpoint}/${discussion.id}`)
      .set('authorization', testUsers[1].accessToken);
    expect(response.statusCode).toBe(400);
  });
  it.skip('should delete a discussion', async () => {
    const response = await server
      .delete(`${endpoint}/${discussion.id}`)
      .set('authorization', testUsers[0].accessToken);
    expect(response.statusCode).toBe(200);
  });
});
