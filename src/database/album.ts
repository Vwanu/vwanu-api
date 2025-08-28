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
import { Media } from './media';
import { PrivacyType } from '../types/enums';

export interface AlbumInterface {
  name: string;
  privacyType: PrivacyType;
  coverPicture?: string;
  userId: number;
}

@Table({
  modelName: 'Album',
  tableName: 'albums',
  underscored: true,
} as TableOptions<Album>)
export class Album extends Model<AlbumInterface> implements AlbumInterface {

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    defaultValue: PrivacyType.PUBLIC,
    validate: {
      isIn: [Object.values(PrivacyType)],
    },
  })
  privacyType!: PrivacyType;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  coverPicture?: string;

  // Foreign keys
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'user_id',
  })
  userId!: number;

  // Relationships
  @BelongsTo(() => User)
  user!: User;
  @ForeignKey(() => Media)
  @BelongsToMany(() => Media, {
    through: 'album_media', // String-based junction table
    foreignKey: 'album_id',
    otherKey: 'media_id',
    })
  media!: Media[];
}
