/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import request from 'supertest';
import app from '../../src/app';
import { getRandUsers } from '../../src/lib/utils/generateFakeUser';


const userEndpoint = '/users';
const endpoint = '/user_notification_types';
const notificationEndpoint = '/notifications';
let users = [];
let server;

describe("user notification Types  service", () => {

  beforeAll(async () => {
    server = request(app);
    users = await Promise.all(
      getRandUsers(2)
        .map(userData =>
          server
            .post(userEndpoint)
            .send({ ...userData, id: undefined })));
    users = users.map(user => user.body);
  })

  it('registered the service', () => {
    const service = app.service(endpoint.split('/')[1]);
    expect(service).toBeTruthy();
  });

  it('Should list all user notification settings', async () => {
    const user1 = users[0];
    const res = await server.get(endpoint).set('Authorization', `Bearer ${user1.accessToken}`);
    expect(res.status).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });
  it('User 1 should be notified when user 2 comment their post', async () => {
    const user1 = users[0];
    const user2 = users[1];
    const post = await server.post('/posts').send({ content: 'test post' }).set('Authorization', `Bearer ${user1.accessToken}`);
    await server.post(`/comments/`).send({
      content: 'test comment',
      post_id: post.body.id
    }).set('Authorization', `Bearer ${user2.accessToken}`);
    const notifications = await server.get(notificationEndpoint).set('Authorization', `Bearer ${user1.accessToken}`);
    expect(notifications.body.length).toBeGreaterThan(0);
    expect(notifications.body[0].type).toBe('comment');
    expect(notifications.body[0].from).toBe(user2.id);
    expect(notifications.body[0].to).toBe(user1.id);
    expect(notifications.body[0].sound).toBeTruthy();
  }
  );
  it('User 1 should set their post comment notification settings to silent', async () => {
    const user1 = users[0];
    const res = await server.patch(`${endpoint}/1`).send({ sound: false }).set('Authorization', `Bearer ${user1.accessToken}`);
    expect(res.status).toEqual(200);
  });
  it('user 1 should be silently notified when user 2 likes their post', async () => {
    ;


    const user1 = users[0];
    const user2 = users[1];
    const post = await server.post('/posts').send({ content: 'test post' }).set('Authorization', `Bearer ${user1.accessToken}`);
    await server.post(`/comments/`).send({
      content: 'test comment',
      post_id: post.body.id
    }).set('Authorization', `Bearer ${user2.accessToken}`);
    const notifications = await server.get(notificationEndpoint).set('Authorization', `Bearer ${user1.accessToken}`);
    expect(notifications.body.length).toBeGreaterThan(0);
    expect(notifications.body[0].type).toBe('comment');
    expect(notifications.body[0].from).toBe(user2.id);
    expect(notifications.body[0].to).toBe(user1.id);
    expect(notifications.body[0].sound).toBeFalsy();
  });

});
