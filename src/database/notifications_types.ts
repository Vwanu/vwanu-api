import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  TableOptions,
} from 'sequelize-typescript';

import { NotificationSlug } from '../types/notifications';

export interface NotificationTypesInterface {
  id?: number;
  slug: NotificationSlug;
  label: string;
  description: string | null;
}

/**
 * Lookup table for notification kinds. Seeded by migration from
 * `NOTIFICATION_TYPE_SEEDS` in src/types/notifications.ts — the slug is the
 * stable join key with the `NotificationSlug` TypeScript enum.
 */
@Table({
  modelName: 'NotificationTypes',
  tableName: 'notification_types',
  underscored: true,
  timestamps: false,
} as TableOptions<NotificationType>)
export class NotificationType
  extends Model<NotificationTypesInterface>
  implements NotificationTypesInterface
{
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  id!: number;

  @Unique
  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  slug!: NotificationSlug;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  label!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description!: string | null;
}

export default NotificationType;
