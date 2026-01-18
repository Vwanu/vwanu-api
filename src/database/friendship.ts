import { Table, Column, Model, DataType, PrimaryKey, AllowNull, ForeignKey, BelongsTo, TableOptions } from 'sequelize-typescript';
import { User } from './user';
import { FriendshipStatus } from '../types/enums';

export interface FriendshipInterface {
  id: string;
  userId: string;
  targetId: string;
  status: FriendshipStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

@Table({
  modelName: 'Friendship',
  tableName: 'friendships',
  underscored: true,
//   validate: {
    // Validate that user is not trying to befriend themselves
//     notSameUser(this: Friendship) {
//       if (this.userId === this.targetId) {
//         throw new Error('Users cannot befriend themselves');
//       }
//     },
//   },
} as TableOptions<Friendship>)
export class Friendship extends Model<FriendshipInterface> implements FriendshipInterface {

  @PrimaryKey
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  userId!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'target_id',
  })
  targetId!: string;

  @AllowNull(false)
  @Column({
    type: DataType.SMALLINT,
    allowNull: false,
    defaultValue: FriendshipStatus.PENDING,
  })
  status!: FriendshipStatus;

  // Associations
  @BelongsTo(() => User, 'userId')
  user!: User;

  @BelongsTo(() => User, 'targetId')
  target!: User;

  // Instance methods for better encapsulation
  public isPending(): boolean {
    return this.status === FriendshipStatus.PENDING;
  }

  public isAccepted(): boolean {
    return this.status === FriendshipStatus.ACCEPTED;
  }

  public isDenied(): boolean {
    return this.status === FriendshipStatus.DENIED;
  }

  public accept(): void {
    this.status = FriendshipStatus.ACCEPTED;
  }

  public deny(): void {
    this.status = FriendshipStatus.DENIED;
  }

  public getTimeSinceCreated(): number {
    if (!this.createdAt) return 0;
    return Date.now() - this.createdAt.getTime();
  }

  public getTimeSinceCreatedInHours(): number {
    return Math.floor(this.getTimeSinceCreated() / (1000 * 60 * 60));
  }

  public isRecent(hoursThreshold = 24): boolean {
    return this.getTimeSinceCreatedInHours() < hoursThreshold;
  }

  // Static method to find friendship in either direction
  public static async findBidirectional(userIdA: string, userIdB: string): Promise<Friendship | null> {
    return await (this as any).findOne({
      where: {
        ['OR']: [
          { userId: userIdA, targetId: userIdB },
          { userId: userIdB, targetId: userIdA },
        ],
      },
    });
  }

  // Static method to check if friendship exists in either direction
  public static async existsBidirectional(userIdA: string, userIdB: string): Promise<boolean> {
    const friendship = await this.findBidirectional(userIdA, userIdB);
    return friendship !== null;
  }
}
