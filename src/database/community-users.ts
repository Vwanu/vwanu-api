import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt } from 'sequelize-typescript';
import { User } from './user';
import { Community } from './communities';
import { CommunityRoleType } from '../types/enums';

export interface CommunityUsersInterface {
  communityId: string;
  userId: string;
  role: CommunityRoleType;
  joinedAt?: Date;
}

@Table({
  modelName: 'CommunityUsers',
})
export class CommunityUser extends Model<CommunityUsersInterface> implements CommunityUsersInterface {
  
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
  @Column({
    type: DataType.ENUM(...Object.values(CommunityRoleType)),
    allowNull: false,
    defaultValue: CommunityRoleType.MEMBER,
    field: 'role',
  })
  role!: CommunityRoleType;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'joined_at',
  })
  joinedAt!: Date;

  // Associations
  @BelongsTo(() => User, 'userId')
  user!: User;

  @BelongsTo(() => Community, 'communityId')
  community!: Community;

  // @BelongsTo(() => CommunityRoles, 'communityRoleId') // Replaced with enum
  // role!: CommunityRoles;

  // Instance methods for better encapsulation
  public isAdmin(): boolean {
    return this.role === CommunityRoleType.ADMIN || this.role === CommunityRoleType.OWNER;
  }

  public isModerator(): boolean {
    return this.role === CommunityRoleType.MODERATOR || this.isAdmin();
  }

  public isMember(): boolean {
    return this.role === CommunityRoleType.MEMBER;
  }

  public isOwner(): boolean {
    return this.role === CommunityRoleType.OWNER;
  }

  public canManageCommunity(): boolean {
    return this.isAdmin();
  }

  public canModerate(): boolean {
    return this.isModerator();
  }

  public canInviteMembers(): boolean {
    return this.isModerator();
  }

  public canDeletePosts(): boolean {
    return this.isModerator();
  }

  public canBanUsers(): boolean {
    return this.isAdmin();
  }

  public getPermissionLevel(): number {
    switch (this.role) {
      case CommunityRoleType.OWNER:
        return 4;
      case CommunityRoleType.ADMIN:
        return 3;
      case CommunityRoleType.MODERATOR:
        return 2;
      case CommunityRoleType.MEMBER:
        return 1;
      default:
        return 0;
    }
  }

  // public hasHigherPermissionThan(otherUser: CommunityUsers): boolean {
  //   return this.getPermissionLevel() > otherUser.getPermissionLevel();
  // }

  public getJoinDuration(): number {
    return Date.now() - this.joinedAt.getTime();
  }

  public getJoinDurationInDays(): number {
    return Math.floor(this.getJoinDuration() / (1000 * 60 * 60 * 24));
  }
}
