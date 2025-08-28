import { Table, Column, Model, DataType, ForeignKey, BelongsTo, AllowNull, TableOptions } from 'sequelize-typescript';
import { User } from './user';
import { Community } from './communities';

export interface CommunityBanInterface {
  userId: string;
  communityId: string;
  byUserId: string;
  comment?: string;
  until: Date;
  createdAt?: Date;
}

@Table({
  modelName: 'CommunityBans',
   tableName: 'community_bans',
   underscored: true,
} as TableOptions<CommunityBan>)
export class CommunityBan extends Model<CommunityBanInterface> implements CommunityBanInterface {
  
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  userId!: string;

  @ForeignKey(() => Community)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'community_id',
  })
  communityId!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'by_user_id',
  })
  byUserId!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  comment?: string;

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  until!: Date;

  // Associations
  @BelongsTo(() => User, 'userId')
  bannedUser!: User;

  @BelongsTo(() => Community, 'communityId')
  community!: Community;

  @BelongsTo(() => User, 'byUserId')
  bannedByUser!: User;

  // Instance methods for better encapsulation
  public isActive(): boolean {
    return new Date() < this.until;
  }

  public isExpired(): boolean {
    return !this.isActive();
  }

  public getRemainingTime(): number {
    if (this.isExpired()) return 0;
    return this.until.getTime() - Date.now();
  }

  public getRemainingDays(): number {
    return Math.ceil(this.getRemainingTime() / (1000 * 60 * 60 * 24));
  }

  public getRemainingHours(): number {
    return Math.ceil(this.getRemainingTime() / (1000 * 60 * 60));
  }

  public getBanDuration(): number {
    return this.until.getTime() - this.createdAt.getTime();
  }

  public getBanDurationInDays(): number {
    return Math.ceil(this.getBanDuration() / (1000 * 60 * 60 * 24));
  }

  public isPermanent(): boolean {
    // Consider bans longer than 100 years as permanent
    const oneHundredYears = 100 * 365 * 24 * 60 * 60 * 1000;
    return this.getBanDuration() > oneHundredYears;
  }

  public getStatus(): 'active' | 'expired' | 'permanent' {
    if (this.isPermanent()) return 'permanent';
    if (this.isActive()) return 'active';
    return 'expired';
  }
}
