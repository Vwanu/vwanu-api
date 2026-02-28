import { z, object, string, array, TypeOf } from 'zod';
import { CommunityPrivacyType, CommunityPermissionLevel } from '../types/enums';

// Base community schema
export const CommunitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  profilePicture: z.string().url().optional(),
  coverPicture: z.string().url().optional(),
  privacyType: z.nativeEnum(CommunityPrivacyType),
  canInvite: z.nativeEnum(CommunityPermissionLevel),
  canPost: z.nativeEnum(CommunityPermissionLevel),
  canMessageInGroup: z.nativeEnum(CommunityPermissionLevel),
  haveDiscussionForum: z.boolean(),
  creatorId: z.string().uuid(),
  numMembers: z.number().int().min(0),
  numAdmins: z.number().int().min(0),
});

// Create community schema
export const createCommunitySchema = object({
  body: object({
    name: string({
      error: (iss) => iss.input === undefined ? 'Community name is required' : 'Community name must be a string',
    })
      .min(3, 'Community name must be at least 3 characters long')
      .max(100, 'Community name must be at most 100 characters long')
      .trim(),

    description: string({
      error: (iss) => iss.input === undefined ? 'Community description is required' : 'Community description must be a string',
    })
      .min(10, 'Description must be at least 10 characters long')
      .max(2000, 'Description must be at most 2000 characters long')
      .trim(),

    privacyType: z.nativeEnum(CommunityPrivacyType, {
      error: (iss) => iss.input === undefined ? 'Privacy type is required' : 'Invalid privacy type',
    }).default(CommunityPrivacyType.PUBLIC),

    canInvite: z.nativeEnum(CommunityPermissionLevel, {
      error: (iss) => iss.input === undefined ? undefined : 'Invalid permission level for invitations',
    }).default(CommunityPermissionLevel.ADMINS),

    canPost: z.nativeEnum(CommunityPermissionLevel, {
      error: (iss) => iss.input === undefined ? undefined : 'Invalid permission level for posting',
    }).default(CommunityPermissionLevel.EVERYONE),

    canMessageInGroup: z.nativeEnum(CommunityPermissionLevel, {
      error: (iss) => iss.input === undefined ? undefined : 'Invalid permission level for messaging',
    }).default(CommunityPermissionLevel.EVERYONE),

    haveDiscussionForum: z.boolean({
      error: (iss) => iss.input === undefined ? undefined : 'Discussion forum setting must be a boolean',
    }).default(true),

    interests: array(z.string(), {
      error: (iss) => iss.input === undefined ? undefined : 'Interests must be an array of strings',
    }).optional(),

    profilePicture: string().url('Profile picture must be a valid URL').optional(),
    coverPicture: string().url('Cover picture must be a valid URL').optional(),
  }),
});

// Update community schema
export const updateCommunitySchema = object({
  params: object({
    id: string({
      error: (iss) => iss.input === undefined ? 'Community ID is required' : 'Community ID must be a string',
    }).uuid('Community ID must be a valid UUID'),
  }),
  body: object({
    name: string()
      .min(3, 'Community name must be at least 3 characters long')
      .max(100, 'Community name must be at most 100 characters long')
      .trim()
      .optional(),

    description: string()
      .min(10, 'Description must be at least 10 characters long')
      .max(2000, 'Description must be at most 2000 characters long')
      .trim()
      .optional(),

    privacyType: z.nativeEnum(CommunityPrivacyType).optional(),
    canInvite: z.nativeEnum(CommunityPermissionLevel).optional(),
    canPost: z.nativeEnum(CommunityPermissionLevel).optional(),
    canMessageInGroup: z.nativeEnum(CommunityPermissionLevel).optional(),
    haveDiscussionForum: z.boolean().optional(),

    interests: array(z.string()).optional(),
    profilePicture: string().url('Profile picture must be a valid URL').optional(),
    coverPicture: string().url('Cover picture must be a valid URL').optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    {
      message: 'At least one field must be provided for update',
    }
  ),
});

// Get community schema
export const getCommunitySchema = object({
  params: object({
    id: string({
      error: (iss) => iss.input === undefined ? 'Community ID is required' : 'Community ID must be a string',
    }).uuid('Community ID must be a valid UUID'),
  }),
});

// List communities schema
export const listCommunitiesSchema = object({
  query: object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    search: string().optional(),
    privacyType: z.nativeEnum(CommunityPrivacyType).optional(),
    sortBy: z.enum(['name', 'createdAt', 'numMembers', 'numAdmins']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    includeMembers: z.coerce.boolean().default(false),
    interests: array(z.string()).optional(),
  }),
});

// Delete community schema
export const deleteCommunitySchema = object({
  params: object({
    id: string({
      error: (iss) => iss.input === undefined ? 'Community ID is required' : 'Community ID must be a string',
    }).uuid('Community ID must be a valid UUID'),
  }),
});

// Community join/leave schemas
export const joinCommunitySchema = object({
  params: object({
    id: string({
      error: (iss) => iss.input === undefined ? 'Community ID is required' : 'Community ID must be a string',
    }).uuid('Community ID must be a valid UUID'),
  }),
});

export const leaveCommunitySchema = object({
  params: object({
    id: string({
      error: (iss) => iss.input === undefined ? 'Community ID is required' : 'Community ID must be a string',
    }).uuid('Community ID must be a valid UUID'),
  }),
});

// Type exports
export type CommunityInterface = z.infer<typeof CommunitySchema>;
export type CreateCommunityInput = TypeOf<typeof createCommunitySchema>;
export type UpdateCommunityInput = TypeOf<typeof updateCommunitySchema>;
export type GetCommunityInput = TypeOf<typeof getCommunitySchema>;
export type ListCommunitiesInput = TypeOf<typeof listCommunitiesSchema>;
export type DeleteCommunityInput = TypeOf<typeof deleteCommunitySchema>;
export type JoinCommunityInput = TypeOf<typeof joinCommunitySchema>;
export type LeaveCommunityInput = TypeOf<typeof leaveCommunitySchema>;

// Input body types for easier use
export type CreateCommunityData = CreateCommunityInput['body'];
export type UpdateCommunityData = UpdateCommunityInput['body'];
export type ListCommunitiesQuery = ListCommunitiesInput['query'];