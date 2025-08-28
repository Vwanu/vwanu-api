import { Table, Column, Model, DataType, PrimaryKey, AllowNull, Default, TableOptions } from 'sequelize-typescript';

export interface FriendInterface {
  id: string;
  requesterId: number;
  userId: number;
  accepted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Table({
  modelName: 'Friend',
  tableName: 'user_friends',
  underscored: true,
} as TableOptions<Friend>)
export class Friend extends Model<FriendInterface> implements FriendInterface {
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @PrimaryKey
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'RequesterId',
  })
  requesterId!: number;

  @PrimaryKey
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'UserId',
  })
  userId!: number;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  accepted!: boolean;

  // Instance methods for better encapsulation
  public getRequesterId(): number {
    return this.requesterId;
  }

  public getUserId(): number {
    return this.userId;
  }

  public isAccepted(): boolean {
    return this.accepted;
  }

  public isPending(): boolean {
    return !this.accepted;
  }

  public acceptFriendship(): void {
    this.accepted = true;
  }

  public rejectFriendship(): void {
    // In most systems, rejecting means deleting the record
    // But we could also track rejections if needed
    this.accepted = false;
  }

  public isSelfRequest(): boolean {
    return this.requesterId === this.userId;
  }

  public getFriendshipData(): FriendInterface {
    return {
      id: this.id,
      requesterId: this.requesterId,
      userId: this.userId,
      accepted: this.accepted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public getOtherUserId(currentUserId: number): number | null {
    if (this.requesterId === currentUserId) {
      return this.userId;
    } else if (this.userId === currentUserId) {
      return this.requesterId;
    }
    return null; // Current user is not part of this friendship
  }

  public isUserInvolved(userId: number): boolean {
    return this.requesterId === userId || this.userId === userId;
  }
}

export default Friend;
