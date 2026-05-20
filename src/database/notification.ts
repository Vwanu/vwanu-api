import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AllowNull,
  ForeignKey,
  BelongsTo,
  TableOptions,
} from 'sequelize-typescript';
import { User } from './user';
import { NotificationType } from './notifications_types';
import { EntityType } from '../types/enums';

export interface NotificationInterface {
  id: string;
  userId: string;
  message?: string;
  type?: string;
  entityName?: EntityType;
  entityId?: string;
  notificationTypeId: number;
  readAt?: Date | null;
  fromUserId?: string;
}

@Table({
  modelName: 'Notification',
  tableName: 'notifications',
  underscored: true,
} as TableOptions<Notification>)
export class Notification
  extends Model<NotificationInterface>
  implements NotificationInterface
{
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

  @ForeignKey(() => NotificationType)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'notification_type_id',
  })
  notificationTypeId!: number;

  /**
   * `null` = unread; non-null = read at this timestamp. Replaces the old
   * `read BOOLEAN` (was stored as `view`) so we get "since you last saw it"
   * for free.
   */
  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'read_at',
  })
  readAt?: Date | null;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'from_user_id',
  })
  fromUserId?: string;

  @BelongsTo(() => User, 'userId')
  user!: User;

  @BelongsTo(() => User, 'fromUserId')
  fromUser?: User;

  @BelongsTo(() => NotificationType, 'notificationTypeId')
  notificationType!: NotificationType;

  public isRead(): boolean {
    return this.readAt != null;
  }

  public isUnread(): boolean {
    return this.readAt == null;
  }

  public markAsRead(): void {
    this.readAt = new Date();
  }

  public markAsUnread(): void {
    this.readAt = null;
  }
}

export default Notification;
