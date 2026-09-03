import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AllowNull,
  Default,
  TableOptions,
} from 'sequelize-typescript';

import { User } from './user';
import { NotificationType } from './notifications_types';

export interface UserNotificationPreferenceInterface {
  userId: string;
  notificationTypeId: number;
  in_app: boolean;
  push: boolean;
}

/**
 * Per-user, per-type notification preferences. One row per (user, type)
 * created eagerly at signup via the after-create hook in users.hooks.ts.
 *
 * Invariant enforced by DB-level CHECK constraint + UI normalization:
 *   `push = true` REQUIRES `in_app = true`.
 * A user can have in-app without push, but not the other way around.
 */
@Table({
  modelName: 'UserNotificationPreference',
  tableName: 'user_notification_preference',
  underscored: true,
  timestamps: false,
} as TableOptions<UserNotificationPreference>)
export class UserNotificationPreference
  extends Model<UserNotificationPreferenceInterface>
  implements UserNotificationPreferenceInterface
{
  @ForeignKey(() => User)
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  userId!: string;

  @ForeignKey(() => NotificationType)
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'notification_type_id',
  })
  notificationTypeId!: number;

  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  })
  in_app!: boolean;

  @Default(false)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  push!: boolean;

  @BelongsTo(() => User, 'userId')
  user!: User;

  @BelongsTo(() => NotificationType, 'notificationTypeId')
  type!: NotificationType;
}

export default UserNotificationPreference;
