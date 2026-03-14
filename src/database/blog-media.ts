import { Table, Column, Model, DataType, ForeignKey, BelongsTo, TableOptions } from 'sequelize-typescript';
import { Media } from './media';
import { Blog } from './blog';

export interface BlogMediaInterface {
  blog_id: string;
  medium_id: number;
}

@Table({
  modelName: 'BlogMedia',
  tableName: 'blog_medias',
  timestamps: false, // No created_at/updated_at columns
  underscored: true,
} as TableOptions<BlogMedia>)

export class BlogMedia extends Model<BlogMediaInterface> implements BlogMediaInterface {
  @ForeignKey(() => Blog)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
    field: 'blog_id',
  })
  blog_id!: string;

  @ForeignKey(() => Media)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'medium_id',
  })
  medium_id!: number;

  @BelongsTo(() => Blog)
  blog!: Blog;

  @BelongsTo(() => Media)
  media!: Media;
}
