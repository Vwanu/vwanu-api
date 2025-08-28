import { Table, Column, Model, DataType, PrimaryKey, AllowNull, BelongsToMany, TableOptions } from 'sequelize-typescript';
import { User } from './user';
import { ConversationType } from '../types/enums';

export interface ConversationInterface {
  id: string;
  amountOfPeople: number;
  amountOfMessages: number;
  amountOfUnreadMessages: number;
  type: ConversationType;
  name?: string;
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
    defaultValue: 0,
    allowNull: false,
    field: 'amount_of_people',
    validate: {
      min: 0,
      max: 1000, // Reasonable limit for group conversations
    },
  })
  amountOfPeople!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false,
    field: 'amount_of_messages',
    validate: {
      min: 0,
    },
  })
  amountOfMessages!: number;

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
  })
  name?: string;

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

  public incrementMessageCount(): void {
    this.amountOfMessages += 1;
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

  public getDisplayName(): string {
    if (this.isGroup() && this.name) {
      return this.name;
    }
    if (this.isDirect()) {
      return 'Direct Message';
    }
    return `Group Chat (${this.amountOfPeople} members)`;
  }

  public canAddParticipants(): boolean {
    return this.isGroup() && this.amountOfPeople < 1000;
  }

  public isEmpty(): boolean {
    return this.amountOfMessages === 0;
  }

  public getConversationSummary(): string {
    const typeText = this.isDirect() ? 'Direct conversation' : 'Group conversation';
    const messageText = this.amountOfMessages === 1 ? 'message' : 'messages';
    const unreadText = this.amountOfUnreadMessages > 0 
      ? ` (${this.amountOfUnreadMessages} unread)` 
      : '';
    
    return `${typeText} with ${this.amountOfMessages} ${messageText}${unreadText}`;
  }

  public requiresName(): boolean {
    return this.isGroup() && this.amountOfPeople > 2;
  }

  public validateGroupName(): boolean {
    if (this.requiresName()) {
      return Boolean(this.name && this.name.trim().length > 0);
    }
    return true; // No name required for direct messages or small groups
  }

  public canUserSendMessage(userId: string): boolean {
    // Basic validation - would typically check if user is participant
    // This would need to be enhanced with actual participant lookup
    return Boolean(userId) && this.amountOfPeople > 0;
  }

  public isActive(): boolean {
    return this.amountOfPeople > 0;
  }

  public getLastActivityInfo(): string {
    if (this.isEmpty()) {
      return 'No messages yet';
    }
    
    const recentActivity = this.amountOfUnreadMessages > 0 ? 'New messages' : 'Read';
    return `${this.amountOfMessages} messages • ${recentActivity}`;
  }
}
