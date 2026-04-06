/**
 * Junction Tables for Many-to-Many Relationships
 *
 * This file contains lightweight junction table definitions for simple many-to-many
 * relationships that don't warrant their own separate files.
 */
import { difference } from 'lodash';
import { Id } from '@feathersjs/feathers';
import { Table, Column, Model, DataType, ForeignKey, TableOptions, PrimaryKey } from 'sequelize-typescript';



import { Community } from './communities';
import { Interest } from './interest';
import { User } from './user';
import { Blog } from './blog';
import { Post } from './post';
import { ForumDiscussion } from './forumDiscussion';

// Example: Community-Interest junction table (if you needed more than just IDs)
@Table({
  modelName: 'CommunityInterest',
  tableName: 'community_interests',
  underscored: true,
} as TableOptions<CommunityInterest>)
export class CommunityInterest extends Model {
  @PrimaryKey
  @ForeignKey(() => Community)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'community_id',

  })
  communityId!: string;

  @PrimaryKey
  @ForeignKey(() => Interest)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'interest_id',
  })
  interestId!: string;

  // You could add additional fields here if needed, for example:
  // @Column({
  //   type: DataType.INTEGER,
  //   defaultValue: 0,
  // })
  // relevanceScore?: number;

  // @Column({
  //   type: DataType.DATE,
  //   defaultValue: DataType.NOW,
  // })
  // addedAt?: Date;

  /**
   * Calculate the delta between current community interests and new interests
   * Returns only the interest IDs that are not already associated with the community
   * @param communityId - The community ID to check
   * @param newInterests - Array of new interest IDs to compare
   * @returns Array of interest IDs that need to be added
   */
   static async getInterestDelta (communityId: Id, newInterests: string[]): Promise<string[]> {
          // @ts-ignore
          const existingInterests = await this.findAll({
            where: { communityId },
            attributes: ['interestId'],
          });
          if(!existingInterests || existingInterests.length === 0){
            return newInterests;
          }
          const existingInterestIds = existingInterests.map((ci: CommunityInterest) => ci.interestId);
          // Return new interests that don't exist in existing interests
          return difference(newInterests, existingInterestIds);
        }
}

// Example: User-Interest junction table (user's interests/skills)
@Table({
  modelName: 'UserInterest',
  tableName: 'user_interests',
  underscored: true,
} as TableOptions<UserInterest>)
export class UserInterest extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  userId!: string;

  @ForeignKey(() => Interest)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'interest_id',
  })
  interestId!: string;

  // Additional fields for this relationship
  @Column({
    type: DataType.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
    allowNull: true,
  })
  skillLevel?: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: { min: 1, max: 5 }
  })
  interestLevel?: number; // 1-5 rating of how interested they are
}

@Table({
  modelName: 'BlogInterest',
  tableName: 'blog_interests',
  timestamps: false,
  underscored: true,
} as TableOptions<BlogInterest>)
export class BlogInterest extends Model {
  @PrimaryKey
  @ForeignKey(() => Blog)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'blog_id',
  })
  blogId!: string;

  @PrimaryKey
  @ForeignKey(() => Interest)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'interest_id',
  })
  interestId!: string;
}

@Table({
  modelName: 'PostTag',
  tableName: 'post_tags',
  timestamps: false,
  underscored: true,
} as TableOptions<PostTag>)
export class PostTag extends Model {
  @PrimaryKey
  @ForeignKey(() => Post)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'post_id',
  })
  postId!: string;

  @PrimaryKey
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  userId!: string;
}

@Table({
  modelName: 'ForumDiscussionTag',
  tableName: 'forum_discussion_tags',
  timestamps: false,
  underscored: true,
} as TableOptions<ForumDiscussionTag>)
export class ForumDiscussionTag extends Model {
  @PrimaryKey
  @ForeignKey(() => ForumDiscussion)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'forum_discussion_id',
  })
  forumDiscussionId!: string;

  @PrimaryKey
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  userId!: string;
}

// Export all junction tables
export const JunctionTables = {
  CommunityInterest,
  UserInterest,
  BlogInterest,
  PostTag,
  ForumDiscussionTag,
};
