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
import {
  DeviceTokenInterface,
  DevicePlatform,
} from '../schema/device-token.schema';

export type { DeviceTokenInterface, DevicePlatform };

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
