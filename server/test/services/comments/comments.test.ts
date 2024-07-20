/* eslint-disable import/no-extraneous-dependencies */

import { StatusCodes } from 'http-status-codes';

describe('Comments services', () => {
    let observerToken;
    let postMaker;
    let postMakerToken;
    let commenterToken;
    const endpoint = '/comments';
    const postEndpoint = '/posts';

    beforeAll(async () => {
        const testUsers = await global.__getRandUsers(4);
        postMaker = testUsers[1 as any];

        [observerToken, postMakerToken, commenterToken] = testUsers.map(user => user.accessToken)

    }, 30000);

    it('should not create a comment without a post', async () => {
        await global.__SERVER__
            .post(endpoint)
            .send({ postText: "I am a new comment # 1" })
            .set('Authorization', `Bearer ${commenterToken}`)
            .expect(StatusCodes.BAD_REQUEST);
    });

    it('Should create a comment on a post', async () => {
        const postText = "I am a new post # 1"
        const post = await global.__SERVER__
            .post(postEndpoint).send({ postText })
            .set('Authorization', `Bearer ${postMakerToken}`)
            .expect(StatusCodes.CREATED);


        const comment = await global.__SERVER__
            .post(endpoint)
            .send({ postText, PostId: post.body.id })
            .set('Authorization', `Bearer ${postMakerToken}`)
            .expect(StatusCodes.CREATED);

        expect(comment.body).toHaveProperty('id');
        expect(comment.body.PostId).toBe(post.body.id);

    });

    it('Should find all the comments of a post', async () => {
        const postText = "I am a new post # 1"
        const post = await global.__SERVER__
            .post(postEndpoint).send({ postText })
            .set('Authorization', `Bearer ${postMakerToken}`)
            .expect(StatusCodes.CREATED);

        await global.__SERVER__
            .post(endpoint)
            .send({ postText, PostId: post.body.id })
            .set('Authorization', `Bearer ${commenterToken}`)
            .expect(StatusCodes.CREATED);
        await global.__SERVER__
            .post(endpoint)
            .send({ postText, PostId: post.body.id })
            .set('Authorization', `Bearer ${observerToken}`)
            .expect(StatusCodes.CREATED);


        const { body: comments } = await global.__SERVER__
            .get(`${endpoint}/?PostId=${post.body.id}`)
            .set('Authorization', `Bearer ${postMakerToken}`)
            .expect(StatusCodes.OK);

        expect(comments.data).toHaveLength(2);
    });

    it('Should update a comment', async () => {
        const postText = "I am a new post # 1"
        const post = await global.__SERVER__
            .post(postEndpoint).send({ postText })
            .set('Authorization', `Bearer ${postMakerToken}`)
            .expect(StatusCodes.CREATED);

        const commentText = "I am a new comment # 1"
        const comment = await global.__SERVER__
            .post(endpoint)
            .send({ postText: commentText, PostId: post.body.id })
            .set('Authorization', `Bearer ${commenterToken}`)
            .expect(StatusCodes.CREATED);

        const updatedCommentText = "I am a new comment # 1 updated"
        const updatedComment = await global.__SERVER__
            .patch(`${endpoint}/${comment.body.id}`)
            .send({ postText: updatedCommentText })
            .set('Authorization', `Bearer ${commenterToken}`)
            .expect(StatusCodes.OK);
    });
});