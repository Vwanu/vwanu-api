import { Table, Column, Model, DataType, AllowNull, Default, ForeignKey, BelongsTo, HasMany, BelongsToMany, PrimaryKey, TableOptions } from 'sequelize-typescript';
import { User } from './user';
import { Media } from './media';
import { Korem } from './korem';
import { Community } from './communities';
import { CommunityPrivacyType } from '../types/enums';

export interface PostInterface {
  id?: string; // Optional - will be auto-generated
  postText: string;
  privacyType: CommunityPrivacyType;
  locked: boolean;
  userId: string;
  communityId?: string; // Optional - post may not be part of a community
}

@Table({
  modelName: 'Post',
  tableName: 'posts',
  underscored: true,
} as TableOptions<Post>)
export class Post extends Model<PostInterface> implements PostInterface {

  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4, // Auto-generate UUID
    allowNull: false,
    field: 'id',
  })
  id?: string; 

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    // field: 'post_text',
  })
  postText!: string;

  @Default(CommunityPrivacyType.PUBLIC)
  @Column({
    type: DataType.ENUM(...Object.values(CommunityPrivacyType)),
    defaultValue: CommunityPrivacyType.PUBLIC,
    allowNull: false,
    // field: 'privacy_type',
  })
  privacyType!: CommunityPrivacyType;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
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
  @Column({
    type: DataType.UUID,
    allowNull: true, 
    field: 'community_id',
  })
  communityId?: string;

  @ForeignKey(() => Post)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'post_id',
  })
  PostId?: string;

  // TODO: Convert these associations to decorators when other models are converted
  @BelongsTo(() => User)
  user!: User;
  
  @BelongsTo(() => Community, { onDelete: 'SET NULL' }) // Use SET NULL instead of CASCADE for optional relationship
  community?: Community; // Optional - post may not be part of a community   
  
  @BelongsToMany(() => Media, {
    through: () => require('./post-media').PostMedia,
    foreignKey: 'post_id',
    otherKey: 'medium_id',
  })
  media!: Media[];
  
  
  @HasMany(() => Post, { as: 'Comments' })
  comments!: Post[];

  @HasMany(() => Korem, { 
    //through: 'post_reactions', // Junction table for reactions
    foreignKey: 'entityId',
    otherKey: 'koremId',
    constraints: false,
    scope: { entityType: 'Post' }
  })
  reactions!: Korem[];

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

  public isLocked(): boolean {
    return this.locked;
  }

  public canBeViewed(): boolean {
    return !this.locked;
  }

  public canBeCommentedOn(): boolean {
    return !this.locked;
  }

  public lock(): void {
    this.locked = true;
  }

  public unlock(): void {
    this.locked = false;
  }

  public getPreview(maxLength = 150): string {
    if (!this.postText) return '';
    return this.postText.length > maxLength 
      ? `${this.postText.substring(0, maxLength)}...` 
      : this.postText;
  }

  public isOwnedBy(userId: string): boolean {
    return this.userId === userId;
  }

  public isPartOfCommunity(): boolean {
    return !!this.communityId;
  }

  public hasMedia(): boolean {
    return this.media && this.media.length > 0;
  }

  public getCommunityName(): string {
    return this.community?.name || 'No Community';
  }

  public getPostType(): string {
    if (this.isPartOfCommunity()) {
      return 'Community Post';
    }
    return 'Personal Post';
  }

  public getStatusText(): string {
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

  public hasContent(): boolean {
    return !!this.postText && this.postText.trim().length > 0;
  }

  public getWordCount(): number {
    if (!this.postText) return 0;
    return this.postText.trim().split(/\s+/).length;
  }

  public isLongPost(threshold = 500): boolean {
    return this.postText ? this.postText.length > threshold : false;
  }

  public canBeShared(): boolean {
    // Posts can be shared if they're public and not locked
    return this.isPublic() && !this.isLocked();
  }

  public getVisibilityScope(): string {
    if (this.isPartOfCommunity()) {
      return `${this.getPrivacyDisplayText()} in ${this.getCommunityName()}`;
    }
    return `${this.getPrivacyDisplayText()} Personal Post`;
  }

  public getMediaCount(): number {
    return this.media ? this.media.length : 0;
  }

  public isTextOnly(): boolean {
    return this.hasContent() && !this.hasMedia();
  }

  public isMediaOnly(): boolean {
    return this.hasMedia() && !this.hasContent();
  }

  public isMixedContent(): boolean {
    return this.hasContent() && this.hasMedia();
  }

  public getContentType(): string {
    if (this.isMixedContent()) return 'Text & Media';
    if (this.isMediaOnly()) return 'Media Only';
    if (this.isTextOnly()) return 'Text Only';
    return 'Empty';
  }

  // Validation method
  public isValid(): boolean {
    // A post must have either text content or media
    return this.hasContent() || this.hasMedia();
  }
}
