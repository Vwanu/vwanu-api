
import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user';
import { NotificationSlug } from '../types/enums';

export interface UserNotificationTypesInterface {
  userId: string;
  notificationSlug: NotificationSlug;
  text: boolean;
  email: boolean;
  sound: boolean;
  inApp: boolean;
}

@Table({
  modelName: 'UserNotificationTypes',
})
export class UserNotificationTypes extends Model<UserNotificationTypesInterface> implements UserNotificationTypesInterface {
  
  @ForeignKey(() => User)
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  userId!: string;

  @PrimaryKey
  @Column({
    type: DataType.ENUM(...Object.values(NotificationSlug)),
    allowNull: false,
    field: 'notification_slug',
  })
  notificationSlug!: NotificationSlug;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  text!: boolean;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  })
  email!: boolean;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  })
  sound!: boolean;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    field: 'in_app',
  })
  inApp!: boolean;

  // Associations
  @BelongsTo(() => User, 'userId')
  user!: User;

  // Business logic methods
  public isEnabledForEmail(): boolean {
    return this.email;
  }

  public isEnabledForSMS(): boolean {
    return this.text;
  }

  public isEnabledForInApp(): boolean {
    return this.inApp;
  }

  public isEnabledForSound(): boolean {
    return this.sound;
  }

  public getEnabledChannels(): string[] {
    const channels: string[] = [];
    if (this.inApp) channels.push('in_app');
    if (this.email) channels.push('email');
    if (this.text) channels.push('sms');
    if (this.sound) channels.push('sound');
    return channels;
  }

  public isCompletelyDisabled(): boolean {
    return !this.inApp && !this.email && !this.text && !this.sound;
  }

  public enableAll(): void {
    this.inApp = true;
    this.email = true;
    this.text = true;
    this.sound = true;
  }

  public disableAll(): void {
    this.inApp = false;
    this.email = false;
    this.text = false;
    this.sound = false;
  }

  public enableChannel(channel: 'email' | 'text' | 'sound' | 'inApp'): void {
    this[channel] = true;
  }

  public disableChannel(channel: 'email' | 'text' | 'sound' | 'inApp'): void {
    this[channel] = false;
  }
}
