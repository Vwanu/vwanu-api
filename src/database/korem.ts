import { Table, Column, Model, DataType, AllowNull, ForeignKey, BelongsTo , PrimaryKey} from 'sequelize-typescript';

import { User } from './user';
import { EntityType } from '../types/enums';

export interface KoremInterface {
  entityId: string;
  entityType: EntityType;
  userId: string;
}

@Table({
  modelName: 'Korem',
})
export class Korem extends Model<KoremInterface> implements KoremInterface {
  
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id!: string;

  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'entity_id',
  })
  entityId!: string;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(EntityType)),
    defaultValue: EntityType.POST,
    allowNull: false,
    field: 'entity_type',
  })
  entityType!: EntityType;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  userId!: string;

  // Associations
  @BelongsTo(() => User, 'userId')
  user!: User;

  // Polymorphic associations - commented until all target models are converted
  // @BelongsTo(() => Post, { foreignKey: 'entityId', constraints: false })
  // post?: Post;

  // @BelongsTo(() => Blog, { foreignKey: 'entityId', constraints: false })
  // blog?: Blog;

  // @BelongsTo(() => Community, { foreignKey: 'entityId', constraints: false })
  // community?: Community;

  // Instance methods for better encapsulation
  public isOnPost(): boolean {
    return this.entityType === EntityType.POST;
  }

  public isOnBlog(): boolean {
    return this.entityType === EntityType.BLOG;
  }

  public isOnCommunity(): boolean {
    return this.entityType === EntityType.COMMUNITY;
  }

  public isOnComment(): boolean {
    return this.entityType === EntityType.COMMENT;
  }

  public isOnMessage(): boolean {
    return this.entityType === EntityType.MESSAGE;
  }

  public isOnDiscussion(): boolean {
    return this.entityType === EntityType.DISCUSSION;
  }

  public getTargetType(): string {
    return this.entityType.toLowerCase();
  }

  public getTargetId(): string {
    return this.entityId;
  }

  public isLikeBy(userId: string): boolean {
    return this.userId === userId;
  }

  public getDisplayText(): string {
    const entityName = this.entityType.toLowerCase();
    return `Liked ${entityName}`;
  }

  public getTimeSinceLike(): number {
    return Date.now() - this.createdAt.getTime();
  }

  public getTimeSinceLikeInDays(): number {
    return Math.floor(this.getTimeSinceLike() / (1000 * 60 * 60 * 24));
  }

  public isRecentLike(hoursThreshold = 24): boolean {
    const hoursAgo = this.getTimeSinceLike() / (1000 * 60 * 60);
    return hoursAgo < hoursThreshold;
  }

  // Static helper methods for common use cases
  public static getEntityDisplayName(entityType: EntityType): string {
    const displayNames = {
      [EntityType.POST]: 'Post',
      [EntityType.BLOG]: 'Blog',
      [EntityType.COMMUNITY]: 'Community',
      [EntityType.COMMENT]: 'Comment',
      [EntityType.MESSAGE]: 'Message',
      [EntityType.DISCUSSION]: 'Discussion',
    };
    return displayNames[entityType] || 'Content';
  }
}
