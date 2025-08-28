/* eslint-disable no-param-reassign */
import { Table, Column, Model, DataType, BeforeSave, TableOptions } from 'sequelize-typescript';
import slugify from '../lib/utils/slugify';
import sanitizeHtml from '../lib/utils/sanitizeHtml';

export interface BlogInterface {
  id: string;
  blogText: string;
  blogTitle: string;
  coverPicture: string;
  publish: boolean;
  slug: string;
  amountOfLikes: number;
  amountOfComments: number;
  search_vector: string;
}

@Table({
  modelName: 'Blog',
  tableName: 'blogs',
  underscored: true,
} as TableOptions<Blog>)
export class Blog extends Model<BlogInterface> implements BlogInterface {
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
  blogText!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  blogTitle!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  publish!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  coverPicture!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  slug!: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false,
  })
  amountOfLikes!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false,
  })
  amountOfComments!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  search_vector!: string;

  @BeforeSave
  static sanitizeAndSlugify(instance: Blog) {
    instance.blogText = sanitizeHtml(instance.blogText);
    instance.blogTitle = sanitizeHtml(instance.blogTitle);
    instance.slug = slugify(instance.blogTitle, {
      replacement: '-',
      lower: true,
      strict: true,
    });
  }

  // TODO: Add associations with decorators
  // @BelongsTo(() => User)
  // user!: User;
  
  
  // @BelongsToMany(() => Interest, () => BlogInterest)
  // interests!: Interest[];
  
  // @HasMany(() => Korem, { foreignKey: 'entityId', constraints: false, scope: { entityType: 'Blog' } })
  // reactions!: Korem[];
}
