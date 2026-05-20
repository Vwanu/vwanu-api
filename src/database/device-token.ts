import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AllowNull,
  Default,
  ForeignKey,
  BelongsTo,
  Unique,
  TableOptions,
} from 'sequelize-typescript';
import { User } from './user';

export type DevicePlatform = 'ios' | 'android';

export interface DeviceTokenInterface {
  id?: string;
  userId: string;
  token: string;
  platform: DevicePlatform;
  lastSeenAt?: Date;
}

/**
 * Storage for Expo push notification tokens (VWA-139). Multi-device safe:
 * UNIQUE(token) means a single token can only belong to one user at a time.
 * Signin on a previously-used device UPDATEs the user_id (signin handoff),
 * which closes the privacy hole where User A's pushes would otherwise
 * arrive on a device User B is now signed in on.
 *
 * Don't change UNIQUE(token) to (user_id, token) without re-reading VWA-139.
 */
@Table({
  modelName: 'DeviceToken',
  tableName: 'device_tokens',
  underscored: true,
  timestamps: false,
} as TableOptions<DeviceToken>)
export class DeviceToken
  extends Model<DeviceTokenInterface>
  implements DeviceTokenInterface
{
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
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

  @Unique
  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  token!: string;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM('ios', 'android'),
    allowNull: false,
  })
  platform!: DevicePlatform;

  @Default(DataType.NOW)
  @AllowNull(false)
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'last_seen_at',
  })
  lastSeenAt!: Date;

  @BelongsTo(() => User, 'userId')
  user!: User;
}

export default DeviceToken;
