import { Table, Column, Model, DataType, PrimaryKey, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user';
import { NotificationType, EntityType } from '../types/enums';

export interface NotificationInterface {
  id: string;
  toUserId: string;
  message?: string;
  type?: string;
  viewed: boolean;
  entityName?: EntityType;
  entityId?: string;
  notificationType: NotificationType;
  sound: boolean;
  fromUserId?: string;
}

@Table({
  modelName: 'Notification',
})
export class Notification extends Model<NotificationInterface> implements NotificationInterface {
  
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'to',
  })
  toUserId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  message?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  type?: string;

  @Column({
    type: DataType.ENUM(...Object.values(EntityType)),
    allowNull: true,
    field: 'entity_name',
  })
  entityName?: EntityType;

  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'entity_id',
  })
  entityId?: string;

  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  sound!: boolean;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(NotificationType)),
    allowNull: false,
    field: 'notification_type',
  })
  notificationType!: NotificationType;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: 'view',
  })
  viewed!: boolean;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'from_user_id',
  })
  fromUserId?: string;

  // Associations
  @BelongsTo(() => User, 'toUserId')
  toUser!: User;

  @BelongsTo(() => User, 'fromUserId')
  fromUser?: User;

  // Instance methods for better encapsulation
  public isViewed(): boolean {
    return this.viewed;
  }

  public isUnread(): boolean {
    return !this.viewed;
  }

  public markAsRead(): void {
    this.viewed = true;
  }

  public markAsUnread(): void {
    this.viewed = false;
  }

  public isSoundEnabled(): boolean {
    return this.sound;
  }

  public enableSound(): void {
    this.sound = true;
  }

  public disableSound(): void {
    this.sound = false;
  }

  public isCommunityNotification(): boolean {
    return [
      NotificationType.COMMUNITY_INVITE,
      NotificationType.COMMUNITY_JOIN,
      NotificationType.COMMUNITY_POST,
      NotificationType.COMMUNITY_MENTION
    ].includes(this.notificationType);
  }

  public isSocialNotification(): boolean {
    return [
      NotificationType.FRIEND_REQUEST,
      NotificationType.FRIEND_ACCEPT,
      NotificationType.FOLLOW
    ].includes(this.notificationType);
  }

  public isContentNotification(): boolean {
    return [
      NotificationType.POST_LIKE,
      NotificationType.POST_COMMENT,
      NotificationType.BLOG_LIKE,
      NotificationType.BLOG_COMMENT
    ].includes(this.notificationType);
  }

  public isSystemNotification(): boolean {
    return [
      NotificationType.SYSTEM_UPDATE,
      NotificationType.SECURITY_ALERT
    ].includes(this.notificationType);
  }

  public getCategory(): 'community' | 'social' | 'content' | 'system' | 'other' {
    if (this.isCommunityNotification()) return 'community';
    if (this.isSocialNotification()) return 'social';
    if (this.isContentNotification()) return 'content';
    if (this.isSystemNotification()) return 'system';
    return 'other';
  }

  public getTimeSinceCreated(): number {
    return Date.now() - this.createdAt.getTime();
  }

  public getTimeSinceCreatedInHours(): number {
    return Math.floor(this.getTimeSinceCreated() / (1000 * 60 * 60));
  }

  public isRecent(hoursThreshold = 24): boolean {
    return this.getTimeSinceCreatedInHours() < hoursThreshold;
  }
}
