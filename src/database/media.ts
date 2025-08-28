import { Table, Column, Model, DataType, BeforeSave, BelongsTo , ForeignKey, BelongsToMany, TableOptions} from 'sequelize-typescript';
import config from 'config';
import { User } from './user';
import { Post } from './post';
// import { Post } from './post';
// import { Album } from './album';

const tinySize = config.get('tinySize');
const smallSize = config.get('smallSize');
const mediumSize = config.get('mediumSize');

export interface MediaInterface {
  id: number;
  original: string;
  large: string;
  medium: string;
  small: string;
  tiny: string;
  UserId: string;
}

@Table({
  modelName: 'Media',
  tableName: 'media',
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

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  medium!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  large!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  small!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  tiny!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    // field: 'user_id',
    field: 'UserId', // Use camelCase for consistency with other models
  })
  UserId!: string;

  @BeforeSave
  static generateImageSizes(instance: Media) {
    const { tiny, small, medium, original } = instance;

    instance.medium =
      medium !== undefined
        ? medium
        : original.replace(/upload\//g, `upload/${mediumSize}/`);
    instance.small =
      small !== undefined
        ? small
        : original.replace(/upload\//g, `upload/${smallSize}/`);
    instance.tiny =
      tiny !== undefined
        ? tiny
        : original.replace(/upload\//g, `upload/${tinySize}/`);
  }

  // TODO: Add associations with decorators when other models are converted
  @BelongsTo(() => User)
  User!: User;

  @BelongsToMany(() => Post, {
    through: 'Post_Media',
    foreignKey: 'MediumId',
    otherKey: 'PostId',
  })
  posts!: Post[]
  
  // @BelongsToMany(() => Post, {
  //   through: 'post_media', // String-based junction table
  //   foreignKey: 'media_id',
  //   otherKey: 'post_id',
  // })
  // posts!: Post[];

  // @BelongsToMany(() => Album, {
  //   through: 'album_Media', // String-based junction table
  //   foreignKey: 'media_id',
  //   otherKey: 'album_id',
  // })
  // albums!: Album[];
}
