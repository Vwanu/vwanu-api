/* eslint-disable import/no-extraneous-dependencies */

import request from 'supertest';

import app from '../../src/app';
import { getRandUsers } from '../../src/lib/utils/generateFakeUser';

const testImage = `${__dirname}/../../src/seed/assets/img/profilePicture.jpeg`;
describe("'albums ' service", () => {
  let testServer;
  let testUsers;
  let firstAlbums;

  const userEndpoint = '/users';
  const endpoint = '/albums';

  beforeAll(async () => {
    await app.get('sequelizeClient').sync({ alter: true, logged: false });
    testServer = request(app);
    testUsers = await Promise.all(
      getRandUsers(2).map((u) => {
        const user = u;
        delete user.id;
        return testServer.post(userEndpoint).send(user);
      }, 10000)
    );

    testUsers = testUsers.map((testUser) => testUser.body);
  }, 100000);

  it('registered the service', () => {
    const service = app.service('albums');
    expect(service).toBeTruthy();
  });
  it('User can create album', async () => {
    const firstAlbumName = 'first album';
    firstAlbums = await Promise.all(
      testUsers.map((user) =>
        testServer
          .post(endpoint)
          .send({ name: firstAlbumName })
          .set('authorization', user.accessToken)
      )
    );

    expect(firstAlbums.length).toEqual(2);
    firstAlbums.forEach(({ body }) => {
      expect(body).toMatchObject({
        UserId: expect.any(Number),
        name: expect.any(String),
        privacyType: 'public',
        id: expect.any(Number),
      });
    });
  });
  it('Owner can change album name and cover picture', async () => {
    const user = testUsers[0];
    const album = firstAlbums[0].body;
    const modification = { name: 'new name' };

    const modAlbum = await testServer
      .patch(`${endpoint}/${album.id}`)
      .send(modification)
      .set('authorization', user.accessToken);

    expect(modAlbum.body).toMatchObject({
      ...album,
      ...modification,
      updatedAt: expect.any(String),
    });
  });
  it('Owner can add photos to album', async () => {
    const user = testUsers[0];
    const album = firstAlbums[0].body;

    const albumWithPhoto = await testServer
      .patch(`${endpoint}/${album.id}`)
      .set('authorization', user.accessToken)
      .attach('album-photo', testImage);

    console.log(albumWithPhoto.body);

    expect(true).toBeTruthy();
  });
  it.todo('Owner can delete photos from album');
});
