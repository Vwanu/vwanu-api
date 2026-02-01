import { Table, Column, Model, DataType, ForeignKey, BelongsTo, TableOptions } from 'sequelize-typescript';
import { User } from './user';
import { Conversation } from './conversation';

export interface ConversationUserInterface {
  conversationId: string;
  userId: string;
}

@Table({
modelName: 'ConversationUser',
  tableName: 'conversation_users',
  underscored: true,
} as TableOptions<ConversationUser>)
export class ConversationUser extends Model<ConversationUserInterface> implements ConversationUserInterface {

  @ForeignKey(() => Conversation)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
    field: 'conversation_id',
  })
  conversationId!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
    field: 'user_id',
  })
  userId!: string;

  // Associations
  @BelongsTo(() => Conversation, 'conversationId')
  conversation!: Conversation;

  @BelongsTo(() => User, 'userId')
  user!: User;
}
