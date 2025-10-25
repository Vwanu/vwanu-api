// __tests__/services/communities-integration.test.ts
import request from 'supertest';
import { Application } from '@declarations';
import { CommunityPrivacyType, CommunityPermissionLevel } from '@types/enums';
import { createApp } from '../../src/app';
import { generateTestUser, generateTestCommunity } from '../testUtils';

describe('Communities Service Integration Tests', () => {
  let app: Application;
  let authToken: string;
  let user: any;

  beforeAll(async () => {
    app = await createApp();

    // Create a test user and get authentication token
    user = await generateTestUser();
    const loginResponse = await request(app)
      .post('/api/authentication')
      .send({
        strategy: 'local',
        email: user.email,
        password: 'testpassword123'
      });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.get('sequelizeClient').close();
  });

  describe('Community File Upload', () => {
    it('should upload profile picture during community creation', async () => {
      const communityData = generateTestCommunity(user.id);

      const response = await request(app)
        .post('/api/communities')
        .set('Authorization', `Bearer ${authToken}`)
        .field('name', communityData.name)
        .field('description', communityData.description)
        .field('privacyType', CommunityPrivacyType.PUBLIC)
        .field('canInvite', CommunityPermissionLevel.MODERATORS)
        .attach('profilePicture', Buffer.from('fake image data'), 'profile.jpg');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('profilePicture');
      expect(response.body.profilePicture).toMatch(/^https:\/\//);
    });
  });

  describe('Community Search Vector', () => {
    let communityId: string;

    beforeEach(async () => {
      const communityData = generateTestCommunity(user.id);
      const createResponse = await request(app)
        .post('/api/communities')
        .set('Authorization', `Bearer ${authToken}`)
        .send(communityData);

      communityId = createResponse.body.id;
    });

    it('should perform full-text search on communities', async () => {
      const searchResponse = await request(app)
        .get('/api/communities')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          $search: communityData.name.split(' ')[0]
        });

      expect(searchResponse.status).toBe(200);
      expect(searchResponse.body.data).toBeInstanceOf(Array);
      expect(
        searchResponse.body.data.some((comm: any) => comm.id === communityId)
      ).toBe(true);
    });
  });

  describe('Community Permissions and Privacy', () => {
    let publicCommunityId: string;
    let privateCommunityId: string;
    let otherUser: any;
    let otherUserToken: string;

    beforeAll(async () => {
      // Create another test user
      otherUser = await generateTestUser();
      const loginResponse = await request(app)
        .post('/api/authentication')
        .send({
          strategy: 'local',
          email: otherUser.email,
          password: 'testpassword123'
        });

      otherUserToken = loginResponse.body.accessToken;
    });

    beforeEach(async () => {
      // Create public and private communities
      const publicCommunityData = {
        ...generateTestCommunity(user.id),
        privacyType: CommunityPrivacyType.PUBLIC,
        canInvite: CommunityPermissionLevel.EVERYONE
      };

      const privateCommunityData = {
        ...generateTestCommunity(user.id),
        privacyType: CommunityPrivacyType.PRIVATE,
        canInvite: CommunityPermissionLevel.ADMINS
      };

      const publicResponse = await request(app)
        .post('/api/communities')
        .set('Authorization', `Bearer ${authToken}`)
        .send(publicCommunityData);

      const privateResponse = await request(app)
        .post('/api/communities')
        .set('Authorization', `Bearer ${authToken}`)
        .send(privateCommunityData);

      publicCommunityId = publicResponse.body.id;
      privateCommunityId = privateResponse.body.id;
    });

    it('allows non-members to view public communities', async () => {
      const response = await request(app)
        .get(`/api/communities/${publicCommunityId}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(response.status).toBe(200);
    });

    it('prevents non-members from viewing private communities', async () => {
      const response = await request(app)
        .get(`/api/communities/${privateCommunityId}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(response.status).toBe(403);
    });
  });
});