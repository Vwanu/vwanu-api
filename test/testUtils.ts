// testUtils.ts
import { User } from '@database/user';
import { Community } from '@database/communities';
import { CommunityPrivacyType, CommunityPermissionLevel } from '@types/enums';

export const generateTestUser = async (overrides = {}) => {
  const userCounter = Math.floor(Math.random() * 10000);
  const userData = {
    firstName: `Test${userCounter}`,
    lastName: `User${userCounter}`,
    email: `testuser${userCounter}@example.com`,
    password: 'testpassword123',
    ...overrides
  };

  const user = await User.create(userData);
  return user;
};

export const generateTestCommunity = (creatorId: string, overrides = {}) => {
  const communityCounter = Math.floor(Math.random() * 10000);
  return {
    name: `Test Community ${communityCounter}`,
    description: `A test community description for ${communityCounter}`,
    creatorId,
    privacyType: CommunityPrivacyType.PUBLIC,
    canInvite: CommunityPermissionLevel.MODERATORS,
    numMembers: 1,
    numAdmins: 1,
    ...overrides
  };
};