// eslint-disable-next-line import/no-extraneous-dependencies
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import app from '../../src/app'; // Update this path to where your app instance is defined
import {
  getRandUsers
} from '../../src/lib/utils/generateFakeUser';






/* #endregion */
describe('PhoneManagement Service', () => {
  let testServer;
  let testUsers = [];
  const endpoint = '/phone';
  const userEndpoint = '/users';

  // Setup before all tests run
  beforeAll(async () => {
    testServer = request(app);
    testUsers = await Promise.all(
      getRandUsers(3).map((u) =>
        testServer.post(userEndpoint).send({ ...u, id: undefined })
      )
    );
    testUsers = testUsers.map(testuser => testuser?.body)
  });

  afterAll(async () => {
    await Promise.all(
      testUsers.map(user => testServer
        .delete(`${endpoint}/${user.id}`)
        .set('authorization', user.accessToken)));
  });

  describe('Service is runing', () => {
    it('The service is runing normaly', () => {
      const service = app.service('phone');
      expect(service).toBeTruthy();

    })
  })


  describe('POST /phone', () => {
    it('should successfully add a new phone number for the user association without returning a verification code', async () => {

      // user 
      const user = testUsers[0];
      // country code 
      const countryCode = (await testServer.get('/country?name=Afghanistan').send().set('Authorization', `Bearer ${user.accessToken}`)).body[0].id

      const res = await request(app)
        .post(endpoint)
        .set('Authorization', `Bearer ${testUsers[0].accessToken}`)
        .send({
          userId: user.id,
          phoneNumber: '1234567890',
          countryCode,
        });
      expect(res.statusCode).toBe(StatusCodes.CREATED);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain(' Verification code sent.');
    });

    //   // Additional tests...
  });

  // Additional describe blocks for find, patch, deletepw...

  // Cleanup after all tests
  afterAll(async () => {
    // Clean up test users and related data
  });
});
