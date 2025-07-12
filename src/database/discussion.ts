import { Table, Column, Model, DataType, PrimaryKey, AllowNull, Default, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user';
import { Community } from './communities';
import { CommunityPrivacyType } from '../types/enums';

export interface DiscussionInterface {
  id: string;
  body: string;
  title: string;
  privacyType: CommunityPrivacyType;
  banned: boolean;
  bannedReason?: string;
  locked: boolean;
  userId: string;
  communityId: string;
}

@Table({
  modelName: 'Discussion',
})
export class Discussion extends Model<DiscussionInterface> implements DiscussionInterface {
  
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id!: string;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  body!: string;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  title!: string;

  @Default(CommunityPrivacyType.PUBLIC)
  @Column({
    type: DataType.ENUM(...Object.values(CommunityPrivacyType)),
    defaultValue: CommunityPrivacyType.PUBLIC,
    field: 'privacy_type',
  })
  privacyType!: CommunityPrivacyType;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  banned!: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'banned_reason',
  })
  bannedReason?: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  locked!: boolean;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  userId!: string;

  @ForeignKey(() => Community)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'community_id',
  })
  communityId!: string;

  // Associations
  @BelongsTo(() => User, 'userId')
  user!: User;

  @BelongsTo(() => Community, 'communityId')
  community!: Community;

  // Self-referencing for comments (commented until needed)
  // @HasMany(() => Discussion, 'parentId')
  // comments?: Discussion[];

  // Polymorphic reactions using Korem (commented until needed)
  // @HasMany(() => Korem, { foreignKey: 'entityId', constraints: false, scope: { entityType: EntityType.DISCUSSION } })
  // reactions?: Korem[];

  // Many-to-many relationships (commented until junction tables are set up)
  // @BelongsToMany(() => Media, () => DiscussionMedia)
  // media?: Media[];

  // @BelongsToMany(() => ForumCategory, () => DiscussionForumCategory)
  // forumCategories?: ForumCategory[];

  // Instance methods for better encapsulation
  public isPublic(): boolean {
    return this.privacyType === CommunityPrivacyType.PUBLIC;
  }

  public isPrivate(): boolean {
    return this.privacyType === CommunityPrivacyType.PRIVATE;
  }

  public isHidden(): boolean {
    return this.privacyType === CommunityPrivacyType.HIDDEN;
  }

  public isBanned(): boolean {
    return this.banned;
  }

  public isLocked(): boolean {
    return this.locked;
  }

  public canBeViewed(): boolean {
    return !this.banned;
  }

  public canBeCommentedOn(): boolean {
    return !this.banned && !this.locked;
  }

  public ban(reason?: string): void {
    this.banned = true;
    this.bannedReason = reason;
  }

  public unban(): void {
    this.banned = false;
    this.bannedReason = undefined;
  }

  public lock(): void {
    this.locked = true;
  }

  public unlock(): void {
    this.locked = false;
  }

  public getDisplayTitle(): string {
    return this.title;
  }

  public getPreview(maxLength = 150): string {
    return this.body.length > maxLength 
      ? `${this.body.substring(0, maxLength)}...` 
      : this.body;
  }

  public isOwnedBy(userId: string): boolean {
    return this.userId === userId;
  }

  public getStatusText(): string {
    if (this.banned) return 'Banned';
    if (this.locked) return 'Locked';
    return 'Active';
  }

  public getPrivacyDisplayText(): string {
    const displayNames = {
      [CommunityPrivacyType.PUBLIC]: 'Public',
      [CommunityPrivacyType.PRIVATE]: 'Private',
      [CommunityPrivacyType.HIDDEN]: 'Hidden',
    };
    return displayNames[this.privacyType];
  }
}
