import { Table, Column, Model, DataType, PrimaryKey, AllowNull, Default, ForeignKey, BelongsTo, HasMany, TableOptions } from 'sequelize-typescript';
import { User } from './user';
import { Interest } from './interest';

export interface ForumDiscussionInterface {
  id: string;
  title?: string;
  body: string;
  userId: string;
  interestId: string;
  parentId?: string;
}

@Table({
  modelName: 'ForumDiscussion',
  tableName: 'forum_discussions',
  underscored: true,
} as TableOptions<ForumDiscussion>)
export class ForumDiscussion extends Model<ForumDiscussionInterface> implements ForumDiscussionInterface {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  title?: string;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  body!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  userId!: string;

  @ForeignKey(() => Interest)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'interest_id',
  })
  interestId!: string;

  @ForeignKey(() => ForumDiscussion)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'parent_id',
  })
  parentId?: string;

   @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    field: 'amount_of_replies',
  })
  amountOfReplies?: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    field: 'amount_of_likes',
  })
  amountOfLikes?: number;

  @BelongsTo(() => User, 'userId')
  user!: User;

  @BelongsTo(() => Interest, 'interestId')
  interest!: Interest;

  @BelongsTo(() => ForumDiscussion, 'parentId')
  parent?: ForumDiscussion;

  @HasMany(() => ForumDiscussion, 'parentId')
  replies?: ForumDiscussion[];
}
