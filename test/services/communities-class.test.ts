// __tests__/services/communities-class.test.ts
import { Communities } from '@services/communities/communities.class';
import { Application } from '@declarations';
import { Params } from '@feathersjs/feathers';

describe('Communities Service Class', () => {
  let mockApp: Partial<Application>;
  let mockSequelize: any;
  let communitiesService: Communities;

  beforeEach(() => {
    // Mock the Sequelize client
    mockSequelize = {
      query: jest.fn(),
      QueryTypes: { SELECT: 'SELECT' }
    };

    // Mock the application
    mockApp = {
      get: jest.fn().mockReturnValue(mockSequelize)
    };

    // Create Communities service with mocked dependencies
    communitiesService = new Communities({ Model: {} }, mockApp as Application);
  });

  describe('get() method', () => {
    const mockUserId = 'user-123';
    const mockCommunityId = 'community-456';

    const mockCommunityResult = {
      comm_id: mockCommunityId,
      community_name: 'Test Community',
      commPrivacyType: 'PUBLIC',
      commUserId: mockUserId
    };

    const mockParams: Params = {
      User: { id: mockUserId }
    };

    it('should transform community data correctly', async () => {
      mockSequelize.query.mockResolvedValue([mockCommunityResult]);

      const result = await communitiesService.get(mockCommunityId, mockParams);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        'SELECT * FROM fn_get_community_by_id(?,?)',
        {
          replacements: [mockUserId, mockCommunityId],
          type: mockSequelize.QueryTypes.SELECT
        }
      );

      expect(result).toEqual({
        id: mockCommunityId,
        name: 'Test Community',
        privacyType: 'PUBLIC',
        UserId: mockUserId
      });
    });

    it('should throw error when database query fails', async () => {
      const mockError = new Error('Database error');
      mockSequelize.query.mockRejectedValue(mockError);

      await expect(
        communitiesService.get(mockCommunityId, mockParams)
      ).rejects.toThrow('Database error');
    });

    it('should handle empty result set', async () => {
      mockSequelize.query.mockResolvedValue([]);

      await expect(
        communitiesService.get(mockCommunityId, mockParams)
      ).resolves.toBeUndefined();
    });
  });
});