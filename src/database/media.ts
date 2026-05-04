import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
  BelongsToMany,
  TableOptions,
} from 'sequelize-typescript';
import { User } from './user';
import { Post } from './post';

export interface MediaInterface {
  id: number;
  /**
   * S3 key (e.g. `posts/2026/05/03/<uuid>.jpg`) for media stored in our
   * own bucket, or a passthrough external URL (e.g. UI-Avatars defaults,
   * legacy Cloudinary URLs). Mobile's cdnImageUrl helper handles both.
   *
   * Variant URLs (large/medium/small/tiny) are no longer stored — the
   * CloudFront image-handler stack (VWA-131) generates them on demand.
   */
  original: string;
  UserId: string;
}

@Table({
  modelName: 'Media',
  tableName: 'medias',
  underscored: true,
} as TableOptions<Media>)
export class Media extends Model<MediaInterface> implements MediaInterface {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  original!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  UserId!: string;

  @BelongsTo(() => User)
  User!: User;

  @BelongsToMany(() => Post, {
    through: () => require('./post-media').PostMedia,
    foreignKey: 'medium_id',
    otherKey: 'post_id',
  })
  posts!: Post[];
}
