/* eslint-disable import/no-extraneous-dependencies */
import request from 'supertest';

import app from '../../src/app';
import { getRandUsers } from '../../src/lib/utils/generateFakeUser';

describe("'device-tokens' service", () => {
  let testServer: request.SuperTest<request.Test>;
  let userA: { accessToken: string; id: string };
  let userB: { accessToken: string; id: string };

  beforeAll(async () => {
    const sequelize = app.get('sequelizeClient');
    await sequelize.models.User.sync({ force: true });
    await sequelize.models.DeviceToken.sync({ force: true });

    testServer = request(app);

    const [a, b] = await Promise.all(
      getRandUsers(2).map((u) => {
        const user = u;
        delete user.id;
        return testServer.post('/users').send(user);
      }),
    );

    userA = { accessToken: a.body.accessToken, id: a.body.id };
    userB = { accessToken: b.body.accessToken, id: b.body.id };
  }, 200000);

  beforeEach(async () => {
    const sequelize = app.get('sequelizeClient');
    await sequelize.models.DeviceToken.destroy({ where: {}, truncate: true });
  });

  it('registered the service', () => {
    expect(app.service('device-tokens')).toBeTruthy();
  });

  it('rejects unauthenticated POST with 401', async () => {
    const res = await testServer
      .post('/device-tokens')
      .send({ token: 'ExponentPushToken[unauth]', platform: 'ios' });

    expect(res.status).toBe(401);
  });

  it('registers a new device token', async () => {
    const res = await testServer
      .post('/device-tokens')
      .send({ token: 'ExponentPushToken[a1]', platform: 'ios' })
      .set('authorization', userA.accessToken);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: expect.any(String),
      userId: userA.id,
      token: 'ExponentPushToken[a1]',
      platform: 'ios',
    });
  });

  it('is idempotent for the same user + token (no duplicate row)', async () => {
    const payload = { token: 'ExponentPushToken[idem]', platform: 'ios' };

    const first = await testServer
      .post('/device-tokens')
      .send(payload)
      .set('authorization', userA.accessToken);

    const second = await testServer
      .post('/device-tokens')
      .send(payload)
      .set('authorization', userA.accessToken);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    // Same row reused, so the id should match
    expect(first.body.id).toBe(second.body.id);

    // Confirm only one row exists in DB
    const sequelize = app.get('sequelizeClient');
    const count = await sequelize.models.DeviceToken.count({
      where: { token: payload.token },
    });
    expect(count).toBe(1);
  });

  it('reassigns ownership when a different user registers the same token', async () => {
    const token = 'ExponentPushToken[shared-device]';

    const aReg = await testServer
      .post('/device-tokens')
      .send({ token, platform: 'ios' })
      .set('authorization', userA.accessToken);
    expect(aReg.body.userId).toBe(userA.id);

    // Same device, different user signs in
    const bReg = await testServer
      .post('/device-tokens')
      .send({ token, platform: 'ios' })
      .set('authorization', userB.accessToken);

    expect(bReg.status).toBe(201);
    expect(bReg.body.userId).toBe(userB.id);
    // Same physical row, ownership flipped
    expect(bReg.body.id).toBe(aReg.body.id);

    // User A no longer owns any device_tokens
    const sequelize = app.get('sequelizeClient');
    const aOwned = await sequelize.models.DeviceToken.count({
      where: { userId: userA.id },
    });
    expect(aOwned).toBe(0);
  });

  it('DELETE removes a token owned by the caller', async () => {
    const token = 'ExponentPushToken[del-self]';
    await testServer
      .post('/device-tokens')
      .send({ token, platform: 'ios' })
      .set('authorization', userA.accessToken);

    const res = await testServer
      .delete(`/device-tokens/${encodeURIComponent(token)}`)
      .set('authorization', userA.accessToken);

    expect(res.status).toBe(200);

    const sequelize = app.get('sequelizeClient');
    const count = await sequelize.models.DeviceToken.count({ where: { token } });
    expect(count).toBe(0);
  });

  it('DELETE refuses to remove a token owned by another user (404)', async () => {
    const token = 'ExponentPushToken[other]';
    await testServer
      .post('/device-tokens')
      .send({ token, platform: 'ios' })
      .set('authorization', userA.accessToken);

    const res = await testServer
      .delete(`/device-tokens/${encodeURIComponent(token)}`)
      .set('authorization', userB.accessToken);

    expect(res.status).toBe(404);

    // Row still present
    const sequelize = app.get('sequelizeClient');
    const count = await sequelize.models.DeviceToken.count({ where: { token } });
    expect(count).toBe(1);
  });

  it('rejects invalid platform values', async () => {
    const res = await testServer
      .post('/device-tokens')
      .send({ token: 'ExponentPushToken[bad]', platform: 'windows' })
      .set('authorization', userA.accessToken);

    expect(res.status).toBe(400);
  });

  it('rejects empty token', async () => {
    const res = await testServer
      .post('/device-tokens')
      .send({ token: '', platform: 'ios' })
      .set('authorization', userA.accessToken);

    expect(res.status).toBe(400);
  });
});
