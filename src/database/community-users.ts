import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, TableOptions } from 'sequelize-typescript';

import { User } from './user';
import { Community } from './communities';
import {CommunityRole} from './communityRole.model'

export interface CommunityUsersInterface {
  communityId: string;
  userId: string;
  communityRoleId: string;
  joinedAt?: Date;
}

@Table({
  modelName: 'CommunityUsers',
  tableName: 'community_users',
  underscored: true,
  updatedAt :false
} as TableOptions<CommunityUser>)
export class CommunityUser extends Model<CommunityUsersInterface> {
  
  @ForeignKey(() => Community)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
    field: 'community_id',
  })
  communityId!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
    field: 'user_id',
  })
  userId!: string;

  @ForeignKey(()=>CommunityRole)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'community_role_id',
  })
  communityRoleId!: string
  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  joinedAt!: Date;

  // Associations
  @BelongsTo(() => User, 'userId')
  user!: User;

  @BelongsTo(() => Community, 'communityId')
  community!: Community;

  @BelongsTo(()=> CommunityRole, 'communityRoleId')
  communityRole!: CommunityRole

  // @BelongsTo(() => CommunityRoles, 'communityRoleId') // Replaced with enum
  // role!: CommunityRoles;

  // Instance methods for better encapsulation
  // public isAdmin(): boolean {
  //   return this.role === CommunityRoleType.ADMIN || this.role === CommunityRoleType.OWNER;
  // }

}
