import { Table, Column, Model, DataType, PrimaryKey, AllowNull, ForeignKey, BelongsTo, BeforeSave } from 'sequelize-typescript';
import { User } from './user';
import { Conversation } from './conversation';
// import { Media } from './media'; // Will be uncommented when Media associations are added
// import { MessageMedia } from './message-media'; // Will be uncommented when junction table is created
import sanitizeHtml from '../lib/utils/sanitizeHtml';

export interface MessageInterface {
  id: string;
  messageText?: string;
  read: boolean;
  received: boolean;
  readDate?: Date;
  receivedDate?: Date;
  senderId: string;
  conversationId: string;
}

@Table({
  modelName: 'Message',
})
export class Message extends Model<MessageInterface> implements MessageInterface {
  
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  messageText?: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  received!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  read!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'received_date',
  })
  receivedDate?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'read_date',
  })
  readDate?: Date;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'sender_id',
  })
  senderId!: string;

  @ForeignKey(() => Conversation)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'conversation_id',
  })
  conversationId!: string;

  // Hooks
  @BeforeSave
  static sanitizeMessageText(instance: Message): void {
    if (instance.messageText) {
      instance.messageText = sanitizeHtml(instance.messageText);
    }
  }

  // Associations
  @BelongsTo(() => User, 'senderId')
  sender!: User;

  @BelongsTo(() => Conversation, 'conversationId')
  conversation!: Conversation;

  // @BelongsToMany(() => Media, () => MessageMedia) // Will be uncommented when MessageMedia junction table is created
  // attachments!: Media[];

  // Instance methods for better encapsulation
  public isRead(): boolean {
    return this.read;
  }

  public isReceived(): boolean {
    return this.received;
  }

  public markAsRead(): void {
    this.read = true;
    this.readDate = new Date();
  }

  public markAsReceived(): void {
    this.received = true;
    this.receivedDate = new Date();
  }

  public hasText(): boolean {
    return Boolean(this.messageText && this.messageText.trim().length > 0);
  }

  public getTimeSinceSent(): number {
    return Date.now() - this.createdAt.getTime();
  }

  public getTimeSinceRead(): number | null {
    if (!this.readDate) return null;
    return Date.now() - this.readDate.getTime();
  }

  public getStatus(): 'sent' | 'received' | 'read' {
    if (this.read) return 'read';
    if (this.received) return 'received';
    return 'sent';
  }
}
