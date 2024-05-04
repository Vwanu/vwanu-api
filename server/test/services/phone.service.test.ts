import request from 'supertest';
import app from '../../src/app'; // Update this path to where your app instance is defined
import { StatusCodes } from 'http-status-codes';
import {
  getRandUsers
} from '../../src/lib/utils/generateFakeUser';

/* #endregion */

const endpoint = '/phone';
const userEndpoint = '/users';

/* #region  Global variables and helper functions */


/* #endregion */
describe('PhoneManagement Service', () => {
  let testServer;
  let user;
  let endpoint='/phone';
let testUsers=[];

  // Setup before all tests run
  beforeAll(async () => {
    testServer = request(app);
     testUsers = await Promise.all(
      getRandUsers(3).map((u, idx) => {
        let user = { ...u, admin: false, id:undefined };
        return testServer.post(userEndpoint).send(user);
      })
    );
    testUsers= testUsers.map(testuser => testuser?.body)
  });

  //   afterAll(async () => {
  //   await testServer
  //     .delete(`${endpoint}/${user.id}`)
  //     .set('authorization', user.accessToken);
  // });
  
  describe('Service is runing',()=>{
    it('The service is runing normaly',()=>{
    const service = app.service('phone');
    expect(service).toBeTruthy();

    })
  })

  
  describe('POST /phone', () => {
    it('should successfully add a new phone number for the user association without returning a verification code', async () => {
      const res = await request(app)
        .post(endpoint)
        .set('Authorization', `Bearer ${testUsers[0].accessToken}`)
        .send({
          userId: 'testUserId',
          phoneNumber: '1234567890',
          phoneType: 'cellular',
          countryCode: 'US'
        });
        console.log({status:res.body})
      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body).toHaveProperty('status', 'Verification code sent');
    });

  //   // Additional tests...
  });

  // Additional describe blocks for find, patch, deletepw...

  // Cleanup after all tests
  afterAll(async () => {
    // Clean up test users and related data
  });
});
