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
  TableOptions,
} from 'sequelize-typescript';

import { DeviceToken } from './device-token';
import { Notification } from './notification';

export type PushTicketStatus = 'queued' | 'ok' | 'error';

export interface PushTicketInterface {
  id?: string;
  ticketId?: string | null;
  deviceTokenId: string;
  notificationId: string;
  sentAt?: Date;
  status: PushTicketStatus;
  errorCode?: string | null;
}

@Table({
  modelName: 'PushTicket',
  tableName: 'push_tickets',
  underscored: true,
  timestamps: false,
} as TableOptions<PushTicket>)
export class PushTicket
  extends Model<PushTicketInterface>
  implements PushTicketInterface
{
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  id!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'ticket_id',
  })
  ticketId?: string | null;

  @ForeignKey(() => DeviceToken)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'device_token_id',
  })
  deviceTokenId!: string;

  @ForeignKey(() => Notification)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'notification_id',
  })
  notificationId!: string;

  @Default(DataType.NOW)
  @AllowNull(false)
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'sent_at',
  })
  sentAt!: Date;

  @Default('queued')
  @AllowNull(false)
  @Column({
    type: DataType.ENUM('queued', 'ok', 'error'),
    allowNull: false,
  })
  status!: PushTicketStatus;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'error_code',
  })
  errorCode?: string | null;

  @BelongsTo(() => DeviceToken, 'deviceTokenId')
  deviceToken!: DeviceToken;

  @BelongsTo(() => Notification, 'notificationId')
  notification!: Notification;
}

export default PushTicket;
