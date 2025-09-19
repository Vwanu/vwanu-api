import { Table, Column, Model, DataType, ForeignKey, BelongsTo, TableOptions } from 'sequelize-typescript';
import { Post } from './post';
import { Media } from './media';

export interface PostMediaInterface {
  post_id: string;
  medium_id: number;
}

@Table({
  modelName: 'PostMedia',
  tableName: 'post_medias',
  timestamps: false, // No created_at/updated_at columns
  underscored: true,
} as TableOptions<PostMedia>)
export class PostMedia extends Model<PostMediaInterface> implements PostMediaInterface {
  @ForeignKey(() => Post)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
    field: 'post_id',
  })
  post_id!: string;

  @ForeignKey(() => Media)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'medium_id',
  })
  medium_id!: number;

  @BelongsTo(() => Post)
  post!: Post;

  @BelongsTo(() => Media)
  media!: Media;
}
