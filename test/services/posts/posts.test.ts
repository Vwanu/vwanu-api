/* eslint-disable import/no-extraneous-dependencies */

import { StatusCodes } from 'http-status-codes';
// custom dependencies
import app from '../../../src/app';
import { getRandUsers } from '../../../src/lib/utils/generateFakeUser';
import { mockAuthManager } from '../../utils/mockCognito';

import Service from '../index.test';

// Mock the requireAuth module
jest.mock('../../../src/Hooks/requireAuth', () => ({
  requireAuth: jest.requireActual('../../utils/mockRequireAuth').requireAuth,
}));

describe('Posts services', () => {
  let observer;
  let observerToken;
  let observerIdToken;
  let postMaker;
  let postMakerToken;
  let postMakerIdToken;
  let thePost;
  let commenter;
  let commenterToken;
  let commenterIdToken;
  const userEndpoint = '/users';
  const Posts = new Service('/posts');
  const Reactions = new Service('/reactions');

  class UsersClass extends Service {
    constructor() {
      super(userEndpoint);
    }

    // eslint-disable-next-line class-methods-use-this
    create(user) {
      // In the real implementation, we would call the parent create
      // but with Cognito, we need to register the user first with our mock
      const { accessToken, idToken } = mockAuthManager.registerUser(user);

      // Return an object with the user and tokens in the same format as before
      return Promise.resolve({
        body: {
          ...user,
          accessToken,
          idToken,
        },
      });
    }
  }
  const Users = new UsersClass();

  beforeAll(async () => {
    await app.get('sequelizeClient').models.User.sync({ force: true });

    let testUsers = await Promise.all(
      getRandUsers(4).map((u) => {
        const user = u;
        delete user.id;
        return Users.create(user);
      })
    );

    testUsers = testUsers.map((r) => r.body);
    [observer, postMaker, commenter] = testUsers;

    observerToken = observer.accessToken;
    observerIdToken = observer.idToken;
    postMakerToken = postMaker.accessToken;
    postMakerIdToken = postMaker.idToken;
    commenterToken = commenter.accessToken;
    commenterIdToken = commenter.idToken;
  }, 30000);

  it('should create a new post', async () => {
    const { statusCode, body: response } = await Posts.create(
      { postText: `I am a new post # 1` },
      postMakerToken,
      postMakerIdToken
    );
    thePost = response;
    expect(statusCode).toBe(StatusCodes.CREATED);
  });

  it('should get a list of posts', async () => {
    const { body: post } = await Posts.getList(
      observerToken,
      null,
      observerIdToken
    );

    expect(post.data).toHaveLength(1);
  });

  it('should retrieve a post by its id', async () => {
    const retrievedPost = await Posts.get(
      thePost.id,
      observerToken,
      observerIdToken
    );

    const samePost = retrievedPost.body;
    expect(samePost.id).toEqual(thePost.id);
    expect(samePost.postText).toEqual(thePost.postText);
    expect(retrievedPost.statusCode).toBe(StatusCodes.OK);
  }, 3000);

  it('should create comment for a post', async () => {
    const { statusCode: commentResponse } = await Posts.create(
      {
        postText: 'some message for my comment',
        PostId: thePost.id,
      },
      commenterToken,
      commenterIdToken
    );
    expect(commentResponse).toBe(StatusCodes.CREATED);
  }, 3000);

  it('should find one post with one comment', () => {
    Posts.getList(observerToken, null, observerIdToken).then(
      ({ body: { data } }) => {
        expect(data).toHaveLength(1);
        expect(data[0].amountOfComments).toBe(1);
      }
    );
  });

  it('should find the post and have one comment', async () => {
    const { body: foundPostWithComment } = await Posts.get(
      thePost.id,
      observerToken,
      observerIdToken
    );

    expect(foundPostWithComment.amountOfComments).toEqual(1);
  });

  it('should react on the post', async () => {
    const { statusCode: reactionResponse } = await Reactions.create(
      {
        content: 'like',
        entityId: thePost.id,
        entityType: 'Post',
      },
      commenterToken,
      commenterIdToken
    );

    expect(reactionResponse).toBe(StatusCodes.CREATED);
  });

  it('should find one post with one comment,one reaction, and he is the reactor', () => {
    Posts.getList(commenterToken, null, commenterIdToken).then(
      ({ body: { data } }) => {
        expect(data).toHaveLength(1);
        expect(data[0].amountOfComments).toBe(1);
        expect(data[0].amountOfReactions).toBe(1);
        expect(data[0].isReactor).toHaveLength(1);
      }
    );
  });

  it('should find one post with one comment,one reaction, and he is not the reactor', () => {
    Posts.getList(observerToken, null, observerIdToken).then(
      ({ body: { data } }) => {
        expect(data).toHaveLength(1);
        expect(data[0].amountOfComments).toBe(1);
        expect(data[0].amountOfReactions).toBe(1);
        expect(data[0].isReactor).toBe(null);
      }
    );
  });

  it('should find all comments on a post', async () => {
    const { body: foundComments } = await Posts.getList(
      observerToken,
      `PostId=${thePost.id}`,
      observerIdToken
    );

    expect(foundComments.data).toHaveLength(1);
  });

  it('should retrieve all post by userId', async () => {
    const {
      body: { data: observerPosts },
    } = await Posts.getList(
      observerToken,
      `UserId=${observer.id}`,
      observerIdToken
    );

    expect(observerPosts).toHaveLength(0);

    const {
      body: { data: postMakerPosts },
    } = await Posts.getList(
      observerToken,
      `UserId=${postMaker.id}`,
      observerIdToken
    );

    expect(postMakerPosts).toHaveLength(1);

    const {
      body: { data: commenterPosts },
    } = await Posts.getList(
      observerToken,
      `UserId=${commenter.id}`,
      observerIdToken
    );

    expect(commenterPosts).toHaveLength(0);
  }, 3000);

  it('should not edit a post', async () => {
    const { statusCode: editAttemptStatus } = await Posts.patch(
      thePost.id,
      {
        postText: 'I am a new string do yo like me',
      },
      observerToken,
      observerIdToken
    );
    expect(editAttemptStatus).toEqual(StatusCodes.BAD_REQUEST);
  }, 3000);

  it('should edit a post', async () => {
    const { body: editedLPost } = await Posts.patch(
      thePost.id,
      {
        postText: 'I am a new string do yo like me',
      },
      postMakerToken,
      postMakerIdToken
    );

    expect(editedLPost.id).toEqual(thePost.id);
    expect(editedLPost.postText).toEqual('I am a new string do yo like me');
    expect(editedLPost.UserId).toEqual(thePost.UserId);
  }, 3000);

  it('should lock post', async () => {
    const { body: lockedPost } = await Posts.patch(
      thePost.id,
      { locked: true },
      postMakerToken,
      postMakerIdToken
    );
    expect(lockedPost.locked).toBe(true);
  });

  it('Cannot comment on a locked Post', async () => {
    const commentAttempt = await Posts.create(
      {
        postText: 'Commenting on a locked discussion',
        PostId: thePost.id,
      },
      postMakerToken,
      postMakerIdToken
    );

    expect(commentAttempt.statusCode).toBe(400);
  });

  it('should not delete a post', async () => {
    const users = await Promise.all(
      getRandUsers(2).map((user) => {
        // eslint-disable-next-line no-param-reassign
        delete user.id;
        return Users.create(user);
      })
    );

    const post = await Posts.create(
      { postText: 'New post' },
      users[0].body.accessToken,
      users[0].body.idToken
    );

    const { statusCode } = await Posts.delete(
      post.body.id,
      users[1].body.accessToken,
      users[1].body.idToken
    );

    expect(statusCode).toEqual(StatusCodes.BAD_REQUEST);
  });

  it('should delete a post with all its comment', async () => {
    const deletedPostResponse = await Posts.delete(
      thePost.id,
      postMakerToken,
      postMakerIdToken
    );

    const deletedPost = deletedPostResponse.body;
    expect(deletedPost.id).toEqual(thePost.id);

    const retrievePostResponse = await Posts.get(
      thePost.id,
      observerToken,
      observerIdToken
    );

    expect(retrievePostResponse.statusCode).toBe(StatusCodes.NOT_FOUND);
  }, 3000);

  it('Should delete a comment when the delete request comes from the original post creator', async () => {
    const users = await Promise.all(
      getRandUsers(2).map((user) => {
        // eslint-disable-next-line no-param-reassign
        delete user.id;
        return Users.create(user);
      })
    );

    const post = await Posts.create(
      { postText: 'New post' },
      users[0].body.accessToken,
      users[0].body.idToken
    );

    const comment = await Posts.create(
      { postText: 'New comment', PostId: post.body.id },
      users[1].body.accessToken,
      users[1].body.idToken
    );

    const { statusCode } = await Posts.delete(
      comment.body.id,
      users[0].body.accessToken,
      users[0].body.idToken
    );

    expect(statusCode).toBe(StatusCodes.OK);
  });

  it('should delete a post if the delete request comes from the owner of the wall where the post is added', async () => {
    const users = await Promise.all(
      getRandUsers(2).map((user) => {
        // eslint-disable-next-line no-param-reassign
        delete user.id;
        return Users.create(user);
      })
    );

    const wallPost = await Posts.create(
      { postText: 'New comment', wallId: users[0].body.id },
      users[1].body.accessToken,
      users[1].body.idToken
    );

    const { statusCode } = await Posts.delete(
      wallPost.body.id,
      users[0].body.accessToken,
      users[0].body.idToken
    );

    expect(statusCode).toEqual(StatusCodes.OK);
  });
});
