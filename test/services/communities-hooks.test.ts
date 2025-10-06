// __tests__/services/communities-hooks.test.ts
import { HookContext } from '@feathersjs/feathers';
import { FindCommunities } from '@services/communities/hooks';
import { AutoOwn } from '@Hooks';
import saveProfilePicture from '@Hooks/SaveProfilePictures.hooks';
import LimitToOwner from '@Hooks/LimitToOwner';
import SaveAndAttachInterests from '@Hooks/SaveAndAttachInterest';

describe('Communities Hooks', () => {
  describe('FindCommunities Hook', () => {
    let mockContext: HookContext;

    beforeEach(() => {
      mockContext = {
        method: 'find',
        params: {
          query: {},
          User: { id: 'test-user-123' }
        },
        app: {
          get: jest.fn()
        }
      } as unknown as HookContext;
    });

    it('should modify query to include user context', async () => {
      const context = await FindCommunities(mockContext);

      expect(context.params.query).toHaveProperty('$or');
      expect(context.params.query.$or).toBeInstanceOf(Array);
    });

    it('handles queries without user context', async () => {
      delete mockContext.params.User;
      const context = await FindCommunities(mockContext);

      expect(context.params.query).toEqual({});
    });
  });

  describe('AutoOwn Hook', () => {
    let mockContext: HookContext;

    beforeEach(() => {
      mockContext = {
        method: 'create',
        data: {},
        params: {
          User: { id: 'test-user-123' }
        }
      } as unknown as HookContext;
    });

    it('adds creatorId to data when creating', async () => {
      const context = await AutoOwn(mockContext);

      expect(context.data).toHaveProperty('creatorId', 'test-user-123');
    });

    it('skips modification for non-create methods', async () => {
      mockContext.method = 'find';
      const context = await AutoOwn(mockContext);

      expect(context.data).toEqual({});
    });
  });

  describe('LimitToOwner Hook', () => {
    let mockContext: HookContext;

    beforeEach(() => {
      mockContext = {
        method: 'patch',
        id: 'community-123',
        params: {
          User: { id: 'test-user-123' }
        },
        service: {
          get: jest.fn().mockResolvedValue({ creatorId: 'test-user-123' })
        }
      } as unknown as HookContext;
    });

    it('allows modification by community creator', async () => {
      const context = await LimitToOwner(mockContext);

      expect(context).toBe(mockContext);
    });

    it('throws error for non-creator attempts', async () => {
      mockContext.service.get = jest.fn().mockResolvedValue({ creatorId: 'other-user' });

      await expect(LimitToOwner(mockContext)).rejects.toThrow();
    });
  });

  describe('SaveProfilePicture Hook', () => {
    let mockContext: HookContext;

    beforeEach(() => {
      mockContext = {
        method: 'create',
        data: {},
        params: {
          files: {
            profilePicture: [{ filename: 'profile.jpg' }]
          }
        }
      } as unknown as HookContext;
    });

    it('adds profile picture to data when files are present', async () => {
      const hook = saveProfilePicture(['profilePicture']);
      const context = await hook(mockContext);

      expect(context.data).toHaveProperty('profilePicture');
    });
  });

  describe('SaveAndAttachInterests Hook', () => {
    let mockContext: HookContext;

    beforeEach(() => {
      mockContext = {
        method: 'create',
        result: { id: 'community-123' },
        data: {
          interests: ['tech', 'sports']
        },
        app: {
          service: jest.fn().mockReturnValue({
            create: jest.fn().mockResolvedValue(true)
          })
        }
      } as unknown as HookContext;
    });

    it('attaches interests to new community', async () => {
      const hook = SaveAndAttachInterests({
        entityName: 'Community',
        relationTableName: 'community_interests',
        foreignKey: 'CommunityId'
      });

      const context = await hook(mockContext);

      expect(context.app.service).toHaveBeenCalledWith('community-interests');
    });
  });
});