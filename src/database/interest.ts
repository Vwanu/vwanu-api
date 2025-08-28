import { Table, Column, Model, DataType, TableOptions } from 'sequelize-typescript';
// import { Community } from './communities';

export interface InterestInterface {
  id: string;
  name: string;
}

@Table({
  modelName: 'Interest',
  tableName: 'interests',
  underscored: true,
} as TableOptions<Interest>)
export class Interest extends Model<InterestInterface> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [2, 50], // Name must be between 2-50 characters
      notEmpty: true,
      is: /^[a-zA-Z0-9\s\-_]+$/, // Only alphanumeric, spaces, hyphens, underscores
    },
  })
  name!: string;


  // TODO: Add associations with decorators when other models are converted
  // @BelongsToMany(() => User, () => UserInterests)
  // users!: User[];
  
  // @BelongsToMany(() => ForumCategory, () => CategoryInterests)
  // forumCategories!: ForumCategory[];
  
  // @BelongsToMany(() => Discussion, () => DiscussionInterests)
  // discussions!: Discussion[];
  
  // @HasMany(() => Blog)
  // blogs!: Blog[];
  
  // @BelongsToMany(() => Community, 'community_interests')
  // communities!: Community[];
}
