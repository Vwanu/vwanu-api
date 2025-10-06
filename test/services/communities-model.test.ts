// __tests__/services/communities-model.test.ts
import { Community } from '@database/communities';
import { CommunityPrivacyType, CommunityPermissionLevel } from '@types/enums';
import { sequelize } from '@database/index';

describe('Community Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Model Validation', () => {
    it('should create a valid community', async () => {
      const validCommunity = await Community.create({
        name: 'Test Community',
        description: 'A valid test community description',
        creatorId: '00000000-0000-0000-0000-000000000001', // Assume a test user ID
        privacyType: CommunityPrivacyType.PUBLIC,
        numMembers: 0,
        numAdmins: 1
      });

      expect(validCommunity).toBeDefined();
      expect(validCommunity.name).toBe('Test Community');
    });

    it('should fail creating a community with short name', async () => {
      await expect(Community.create({
        name: 'Hi', // Too short
        description: 'A valid test community description',
        creatorId: '00000000-0000-0000-0000-000000000001',
        privacyType: CommunityPrivacyType.PUBLIC
      })).rejects.toThrow();
    });

    it('should fail creating a community with long name', async () => {
      await expect(Community.create({
        name: 'A'.repeat(101), // Too long
        description: 'A valid test community description',
        creatorId: '00000000-0000-0000-0000-000000000001',
        privacyType: CommunityPrivacyType.PUBLIC
      })).rejects.toThrow();
    });
  });

  describe('Privacy Type Methods', () => {
    let community: Community;

    beforeEach(async () => {
      community = await Community.create({
        name: 'Privacy Test Community',
        description: 'A test community for privacy checks',
        creatorId: '00000000-0000-0000-0000-000000000001',
        privacyType: CommunityPrivacyType.PUBLIC
      });
    });

    test('isPublic() returns correct value', () => {
      community.privacyType = CommunityPrivacyType.PUBLIC;
      expect(community.isPublic()).toBe(true);
      expect(community.isPrivate()).toBe(false);
      expect(community.isHidden()).toBe(false);
    });

    test('isPrivate() returns correct value', () => {
      community.privacyType = CommunityPrivacyType.PRIVATE;
      expect(community.isPrivate()).toBe(true);
      expect(community.isPublic()).toBe(false);
      expect(community.isHidden()).toBe(false);
    });

    test('isHidden() returns correct value', () => {
      community.privacyType = CommunityPrivacyType.HIDDEN;
      expect(community.isHidden()).toBe(true);
      expect(community.isPublic()).toBe(false);
      expect(community.isPrivate()).toBe(false);
    });
  });

  describe('Permission Methods', () => {
    let community: Community;

    beforeEach(async () => {
      community = await Community.create({
        name: 'Permission Test Community',
        description: 'A test community for permission checks',
        creatorId: '00000000-0000-0000-0000-000000000001',
        canInvite: CommunityPermissionLevel.MODERATORS,
        canPost: CommunityPermissionLevel.MODERATORS
      });
    });

    test('canUserInvite() returns correct permissions', () => {
      expect(community.canUserInvite(CommunityPermissionLevel.ADMINS)).toBe(true);
      expect(community.canUserInvite(CommunityPermissionLevel.MODERATORS)).toBe(true);
      expect(community.canUserInvite(CommunityPermissionLevel.EVERYONE)).toBe(false);
    });

    test('canUserPost() returns correct permissions', () => {
      expect(community.canUserPost(CommunityPermissionLevel.ADMINS)).toBe(true);
      expect(community.canUserPost(CommunityPermissionLevel.MODERATORS)).toBe(true);
      expect(community.canUserPost(CommunityPermissionLevel.EVERYONE)).toBe(false);
    });

    test('permission method handles lower and equal level roles', () => {
      community.canInvite = CommunityPermissionLevel.EVERYONE;
      community.canPost = CommunityPermissionLevel.EVERYONE;

      expect(community.canUserInvite(CommunityPermissionLevel.ADMINS)).toBe(true);
      expect(community.canUserInvite(CommunityPermissionLevel.MODERATORS)).toBe(true);
      expect(community.canUserInvite(CommunityPermissionLevel.EVERYONE)).toBe(true);

      expect(community.canUserPost(CommunityPermissionLevel.ADMINS)).toBe(true);
      expect(community.canUserPost(CommunityPermissionLevel.MODERATORS)).toBe(true);
      expect(community.canUserPost(CommunityPermissionLevel.EVERYONE)).toBe(true);
    });
  });
});