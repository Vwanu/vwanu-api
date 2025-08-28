import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
  HasMany,
  TableOptions,
} from 'sequelize-typescript';
import { User } from './user';
import { Blog } from './blog';

export interface BlogResponseInterface {
  id: string;
  responseText: string;
}

@Table({
  modelName: 'BlogResponse',
  tableName: 'blog_responses',
  underscored: true,
} as TableOptions<BlogResponse>)
export class BlogResponse extends Model<BlogResponseInterface> implements BlogResponseInterface {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  responseText!: string;

  // Foreign keys
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId!: number;

  @ForeignKey(() => Blog)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  blogId!: string;

  @ForeignKey(() => BlogResponse)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  parentResponseId?: string;

  // Relationships
  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Blog)
  blog!: Blog;

  @BelongsTo(() => BlogResponse, 'parentResponseId')
  parentResponse?: BlogResponse;

  @HasMany(() => BlogResponse, 'parentResponseId')
  subResponses!: BlogResponse[];
}
