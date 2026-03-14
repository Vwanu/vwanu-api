/* eslint-disable no-param-reassign */
import slugify from '../lib/utils/slugify';
import sanitizeHtml from '../lib/utils/sanitizeHtml';
import { Table, Column, Model, DataType, BeforeSave, BelongsTo,BelongsToMany, TableOptions ,CreatedAt,UpdatedAt, ForeignKey} from 'sequelize-typescript';
import {Blog as BlogInterface} from 'schema/blog.schema'
import {User } from './user'
import { Media } from './media';
import { Interest } from './interest';

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

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  userId!: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'published_at',
  })
  publishedAt!: Date | null;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  updatedAt!: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  search_vector!: string;

  @BelongsTo(() => User)
  user!: User;
  @BelongsToMany(() => Media, {
    through: () => require('./blog-media').BlogMedia,
    foreignKey: 'blog_id',
    otherKey: 'medium_id' })
  media!: Media[];

  @BelongsToMany(() => Interest, {
    through: () => require('./junction-tables').BlogInterest,
    foreignKey: 'blog_id',
    otherKey: 'interest_id',
  })
  interests!: Interest[];
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






  // @HasMany(() => Korem, { foreignKey: 'entityId', constraints: false, scope: { entityType: 'Blog' } })
  // reactions!: Korem[];
}
