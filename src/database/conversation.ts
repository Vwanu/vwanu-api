import { Table, Column, Model, DataType, PrimaryKey, AllowNull, BelongsToMany, TableOptions } from 'sequelize-typescript';
import { User } from './user';
import { ConversationType } from '../types/enums';

export interface ConversationInterface {
  id: string;
  amountOfPeople: number;
  amountOfUnreadMessages: number;
  type: ConversationType;
  groupName?: string;
  groupDescription?: string;
  groupPicture?: string;
}

@Table({
  modelName: 'Conversation',
  tableName: 'conversations',
  underscored: true,
} as TableOptions<Conversation>)
export class Conversation extends Model<ConversationInterface> implements ConversationInterface {

  @PrimaryKey
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id!: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 2,
    allowNull: false,
    field: 'amount_of_people',
    validate: {
      min: 0,
      max: 1000,
    },
  })
  amountOfPeople!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false,
    field: 'amount_of_unread_messages',
    validate: {
      min: 0,
    },
  })
  amountOfUnreadMessages!: number;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(ConversationType)),
    defaultValue: ConversationType.DIRECT,
    allowNull: false,
  })
  type!: ConversationType;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    validate: {
      len: [1, 100], // Group conversation names should be between 1-100 characters
    },
    field:'group_name',
  })
  groupName?: string;

  // Associations
  @BelongsToMany(() => User, {
    'through': 'conversation_users',
    foreignKey: 'conversationId',
    otherKey: 'userId',
  })
  participants!: User[];


  // Instance methods for better encapsulation
  public isDirect(): boolean {
    return this.type === ConversationType.DIRECT;
  }

  public isGroup(): boolean {
    return this.type === ConversationType.GROUP;
  }

  public hasUnreadMessages(): boolean {
    return this.amountOfUnreadMessages > 0;
  }

  public incrementUnreadCount(): void {
    this.amountOfUnreadMessages += 1;
  }

  public markAllAsRead(): void {
    this.amountOfUnreadMessages = 0;
  }

  public addParticipant(): void {
    this.amountOfPeople += 1;
  }

  public removeParticipant(): void {
    if (this.amountOfPeople > 0) {
      this.amountOfPeople -= 1;
    }
  }


  public canAddParticipants(): boolean {
    return this.isGroup() && this.amountOfPeople < 1000;
  }


}
