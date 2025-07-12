/**
 * Junction Tables for Many-to-Many Relationships
 * 
 * This file contains lightweight junction table definitions for simple many-to-many
 * relationships that don't warrant their own separate files.
 */

import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { Community } from './communities';
import { Interest } from './interest';
import { User } from './user';

// Example: Community-Interest junction table (if you needed more than just IDs)
@Table({
  modelName: 'CommunityInterest',
})
export class CommunityInterest extends Model {
  @ForeignKey(() => Community)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'community_id',
  })
  communityId!: string;

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
}

// Example: User-Interest junction table (user's interests/skills)
@Table({
  modelName: 'UserInterest',
})
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

// Export all junction tables
export const JunctionTables = {
  CommunityInterest,
  UserInterest,
};
