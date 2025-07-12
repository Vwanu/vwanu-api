import { Table, Column, Model, DataType, PrimaryKey, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user';

export enum NotificationStatus {
  SOUND = 'sound',
  EMAIL = 'email',
  SOUND_EMAIL = 'sound_email',
  DISABLE = 'disable'
}

export interface UserNotificationSettingsInterface {
  userId: string;
  notificationSettingId: string;
  notificationStatus: NotificationStatus;
}

@Table({
  modelName: 'UserNotificationSettings',
})
export class UserNotificationSettings extends Model<UserNotificationSettingsInterface> implements UserNotificationSettingsInterface {
  
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
    type: DataType.STRING,
    allowNull: false,
    field: 'notification_setting_id',
  })
  notificationSettingId!: string;

  @Column({
    type: DataType.ENUM(...Object.values(NotificationStatus)),
    allowNull: false,
    field: 'notification_status',
  })
  notificationStatus!: NotificationStatus;

  // Associations
  @BelongsTo(() => User, 'userId')
  user!: User;

  // Business logic methods
  public isEnabled(): boolean {
    return this.notificationStatus !== NotificationStatus.DISABLE;
  }

  public isDisabled(): boolean {
    return this.notificationStatus === NotificationStatus.DISABLE;
  }

  public hasSound(): boolean {
    return this.notificationStatus === NotificationStatus.SOUND || 
           this.notificationStatus === NotificationStatus.SOUND_EMAIL;
  }

  public hasEmail(): boolean {
    return this.notificationStatus === NotificationStatus.EMAIL || 
           this.notificationStatus === NotificationStatus.SOUND_EMAIL;
  }

  public getNotificationMethods(): string[] {
    if (this.isDisabled()) return [];
    
    const methods: string[] = [];
    if (this.hasSound()) methods.push('sound');
    if (this.hasEmail()) methods.push('email');
    return methods;
  }

  public enable(): void {
    this.notificationStatus = NotificationStatus.SOUND_EMAIL;
  }

  public disable(): void {
    this.notificationStatus = NotificationStatus.DISABLE;
  }

  public setEmailOnly(): void {
    this.notificationStatus = NotificationStatus.EMAIL;
  }

  public setSoundOnly(): void {
    this.notificationStatus = NotificationStatus.SOUND;
  }

  public setBoth(): void {
    this.notificationStatus = NotificationStatus.SOUND_EMAIL;
  }

  public getStatusDisplayText(): string {
    const displayNames = {
      [NotificationStatus.SOUND]: 'Sound Only',
      [NotificationStatus.EMAIL]: 'Email Only',
      [NotificationStatus.SOUND_EMAIL]: 'Sound & Email',
      [NotificationStatus.DISABLE]: 'Disabled',
    };
    return displayNames[this.notificationStatus];
  }
}
