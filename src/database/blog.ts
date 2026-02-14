/* eslint-disable no-param-reassign */
import slugify from '../lib/utils/slugify';
import sanitizeHtml from '../lib/utils/sanitizeHtml';
import { Table, Column, Model, DataType, BeforeSave, TableOptions ,CreatedAt,UpdatedAt} from 'sequelize-typescript';
import {Blog as BlogInterface} from 'schema/blog.schema'

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
  content!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  titlePicture!: string;

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
    type: DataType.DATE,
    allowNull: true,
    field: 'updated_at',
  })
  publishedAt!: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  createdAt!: string;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updatedAt!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  search_vector!: string;

  @BeforeSave
  static sanitizeAndSlugify(instance: Blog) {
    instance.content = sanitizeHtml(instance.content);
    instance.title = sanitizeHtml(instance.title);
    instance.slug = slugify(instance.title, {
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
