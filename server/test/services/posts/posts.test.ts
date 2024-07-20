import { StatusCodes } from 'http-status-codes';

describe('Posts services', () => {
  let observerToken;
  let postMaker;
  let postMakerToken;
  let commenterToken;
  const endpoint = '/posts';
  beforeAll(async () => {
    const testUsers = await global.__getRandUsers(4);
    postMaker = testUsers[1 as any];

    [observerToken, postMakerToken, commenterToken] = testUsers.map(user => user.accessToken)

  }, 30000);




  it('should create a new post', async () => {
    const postText = "I am a new post # 1"
    await global.__SERVER__
      .post(endpoint).send({ postText })
      .set('Authorization', `Bearer ${postMakerToken}`)
      .expect(StatusCodes.CREATED);
  });
  it('should get a list of posts', async () => {
    const postText = "I am a new post # 2"
    await global.__SERVER__
      .post(endpoint).send({ postText })
      .set('Authorization', `Bearer ${postMakerToken}`)
      .expect(StatusCodes.CREATED);
    const { body: posts } = await global
      .__SERVER__
      .get(endpoint)
      .set('Authorization', `Bearer ${observerToken}`);
    expect(Array.isArray(posts.data)).toBe(true);
    expect(posts.data.length).toBeGreaterThan(0);
  });

  it('should retrieve a post by its id', async () => {
    const postText = "I am a new post # 3"
    const post = await global.__SERVER__
      .post(endpoint).send({ postText })
      .set('Authorization', `Bearer ${postMakerToken}`)
      .expect(StatusCodes.CREATED);

    await global.__SERVER__
      .get(`${endpoint}/${post.body.id}`)
      .set('Authorization', `Bearer ${observerToken}`)
      .expect(StatusCodes.OK);
  });

  it('should retrieve all post by userId', async () => {
    const postText = "I am a new post # 4"
    await global.__SERVER__
      .post(endpoint).send({ postText })
      .set('Authorization', `Bearer ${postMakerToken}`)
      .expect(StatusCodes.CREATED);

    const { body: posts } = await global.__SERVER__
      .get(`${endpoint}/?user_id=${postMaker.id}`).set('Authorization', `Bearer ${observerToken}`)


    expect(Array.isArray(posts.data)).toBe(true);
    expect(posts.data.length).toBeGreaterThan(0);
    expect(posts.data.every(post => post.UserId === postMaker.id)).toBe(true);
  }, 3000);

  it('Someone else can not edit your post', async () => {
    const postText = "I am a new post # 5"
    const post = await global.__SERVER__
      .post(endpoint).send({ postText })
      .set('Authorization', `Bearer ${postMakerToken}`)
      .expect(StatusCodes.CREATED);

    await global.__SERVER__
      .patch(`${endpoint}/${post.body.id}`)
      .send({ postText: "I am a new post # 6" })
      .set('Authorization', `Bearer ${observerToken}`)
      .expect(StatusCodes.BAD_REQUEST);
  }, 3000);

  it('You can edit your own post', async () => {
    const postText = "I am a new post # 7"
    const post = await global.__SERVER__
      .post(endpoint).send({ postText })
      .set('Authorization', `Bearer ${postMakerToken}`)
      .expect(StatusCodes.CREATED);

    await global.__SERVER__
      .patch(`${endpoint}/${post.body.id}`)
      .send({ postText: "I am a new post # 8" })
      .set('Authorization', `Bearer ${postMakerToken}`)
      .expect(StatusCodes.OK);
  }, 3000);

  it('Should be able to lock and unlock a post', async () => {
    const postText = "I am a new post # 9"
    const post = await global.__SERVER__
      .post(endpoint).send({ postText, locked: true })
      .set('Authorization', `Bearer ${postMakerToken}`)
      .expect(StatusCodes.CREATED);
    expect(post.body.locked).toBe(true);
    const { body: updatedPost } = await global.__SERVER__
      .patch(`${endpoint}/${post.body.id}`)
      .send({ locked: false })
      .set('Authorization', `Bearer ${postMakerToken}`)
      .expect(StatusCodes.OK);
    expect(updatedPost.locked).toBe(false);
  });

  it('Someone else cannot modify or delete your post', async () => {
    const postText = "I am a new post # 10"
    const post = await global.__SERVER__
      .post(endpoint).send({ postText })
      .set('Authorization', `Bearer ${postMakerToken}`)
      .expect(StatusCodes.CREATED);

    await global.__SERVER__
      .patch(`${endpoint}/${post.body.id}`)
      .send({ postText: "I am a new post # 11" })
      .set('Authorization', `Bearer ${observerToken}`)
      .expect(StatusCodes.BAD_REQUEST);

    await global.__SERVER__
      .delete(`${endpoint}/${post.body.id}`)
      .set('Authorization', `Bearer ${observerToken}`)
      .expect(StatusCodes.BAD_REQUEST);
  });

  it('You should be able to delete your post', async () => {
    const postText = "I am a new post # 12"
    const post = await global.__SERVER__
      .post(endpoint).send({ postText })
      .set('Authorization', `Bearer ${postMakerToken}`)
      .expect(StatusCodes.CREATED);

    await global.__SERVER__
      .delete(`${endpoint}/${post.body.id}`)
      .set('Authorization', `Bearer ${postMakerToken}`)
      .expect(StatusCodes.OK);
  });
  it('should delete a post with all its comment', async () => {
    const postText = "I am a new post # 13"
    const post = await global.__SERVER__
      .post(endpoint).send({ postText })
      .set('Authorization', `Bearer ${postMakerToken}`)
      .expect(StatusCodes.CREATED);

    const commentText = "I am a new comment # 1"
    const comment = await global.__SERVER__
      .post(endpoint).send({ postText: commentText, PostId: post.body.id })
      .set('Authorization', `Bearer ${commenterToken}`)
      .expect(StatusCodes.CREATED);

    await global.__SERVER__
      .get(`${endpoint}/${comment.body.id}`)
      .set('Authorization', `Bearer ${commenterToken}`)
      .expect(StatusCodes.OK);

    await global.__SERVER__
      .delete(`${endpoint}/${post.body.id}`)
      .set('Authorization', `Bearer ${postMakerToken}`)
      .expect(StatusCodes.OK);

    await global.__SERVER__
      .get(`${endpoint}/${comment.body.id}`)
      .set('Authorization', `Bearer ${commenterToken}`)
      .expect(StatusCodes.NOT_FOUND);

  }, 8000);

  it('Post Author can delete any comments', async () => {

    const postText = "I am a new post # 14"
    const post = await global.__SERVER__
      .post(endpoint).send({ postText })
      .set('Authorization', `Bearer ${postMakerToken}`)
      .expect(StatusCodes.CREATED);

    const commentText = "I am a new comment # 2"
    const comment = await global.__SERVER__
      .post(endpoint).send({ postText: commentText, PostId: post.body.id })
      .set('Authorization', `Bearer ${commenterToken}`)
      .expect(StatusCodes.CREATED);

    await global.__SERVER__
      .delete(`${endpoint}/${comment.body.id}`)
      .set('Authorization', `Bearer ${postMakerToken}`)
      .expect(StatusCodes.OK);

    await global.__SERVER__
      .get(`${endpoint}/${comment.body.id}`)
      .set('Authorization', `Bearer ${commenterToken}`)
      .expect(StatusCodes.NOT_FOUND);
  });

});
