import { Table, Column, Model, DataType, ForeignKey, BelongsTo, AllowNull, CreatedAt, TableOptions } from 'sequelize-typescript';
import { User } from './user';
import { Community } from './communities';

export interface CommunityHistoryInterface {
  userId: string;
  communityId: string;
  joined: boolean;
  createdAt?: Date;
}

@Table({
  modelName: 'CommunityHistory',
  tableName: 'community_history',
  underscored: true,
} as TableOptions<CommunityHistory>)
export class CommunityHistory extends Model<CommunityHistoryInterface> implements CommunityHistoryInterface {
  
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

  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  joined!: boolean;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  createdAt!: Date;

  // Note: updatedAt is disabled for this model as per original config

  // Associations
  @BelongsTo(() => User, 'userId')
  user!: User;

  @BelongsTo(() => Community, 'communityId')
  community!: Community;

  // Instance methods for better encapsulation
  public isJoinEvent(): boolean {
    return this.joined === true;
  }

  public isLeaveEvent(): boolean {
    return this.joined === false;
  }

  public getEventType(): 'joined' | 'left' {
    return this.joined ? 'joined' : 'left';
  }

  public getEventDescription(): string {
    const action = this.joined ? 'joined' : 'left';
    return `User ${action} the community`;
  }

  public getTimeSinceEvent(): number {
    return Date.now() - this.createdAt.getTime();
  }

  public getTimeSinceEventInDays(): number {
    return Math.floor(this.getTimeSinceEvent() / (1000 * 60 * 60 * 24));
  }
}
