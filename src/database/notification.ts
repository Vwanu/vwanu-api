import { Table, Column, Model, DataType, PrimaryKey, AllowNull, ForeignKey, BelongsTo, TableOptions } from 'sequelize-typescript';
import { User } from './user';
import { NotificationType, EntityType } from '../types/enums';

export interface NotificationInterface {
  id: string;
  userId: string;
  message?: string;
  type?: string;
  read: boolean;
  entityName?: EntityType;
  entityId?: string;
  notificationType: NotificationType;
  fromUserId?: string;
}

@Table({
  modelName: 'Notification',
  tableName: 'notifications',
  underscored: true,
} as TableOptions<Notification>)
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
    field: 'user_id',
  })
  userId!: string;

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
  read!: boolean;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'from_user_id',
  })
  fromUserId?: string;

  // Associations
  @BelongsTo(() => User, 'userId')
  user!: User;

  @BelongsTo(() => User, 'fromUserId')
  fromUser?: User;

  // Instance methods for better encapsulation
  public isRead(): boolean {
    return this.read;
  }

  public isUnread(): boolean {
    return !this.read;
  }

  public markAsRead(): void {
    this.read = true;
  }

  public markAsUnread(): void {
    this.read = false;
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
