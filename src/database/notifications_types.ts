
import { Table, Column, Model, DataType, PrimaryKey, AllowNull, Unique } from 'sequelize-typescript';

export interface NotificationTypesInterface {
  notification_slug: string;
  notification_name: string;
  notification_description: string;
}

/**
 * Represents a notification type in the database.
 */
@Table({
  modelName: 'NotificationTypes',
})
export class NotificationType extends Model<NotificationTypesInterface> implements NotificationTypesInterface {
  @PrimaryKey
  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100], // Slug length between 1-100 characters
    },
  })
  notification_slug!: string;

  @Unique
  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 200], // Name length between 1-200 characters
    },
  })
  notification_name!: string;

  @Unique
  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 1000], // Description length between 1-1000 characters
    },
  })
  notification_description!: string;

  // Instance methods for better encapsulation
  public getSlug(): string {
    return this.notification_slug;
  }

  public getName(): string {
    return this.notification_name;
  }

  public getDescription(): string {
    return this.notification_description;
  }

  public getDisplayName(): string {
    return this.notification_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  public getFormattedSlug(): string {
    return this.notification_slug.toUpperCase();
  }

  public isValidForDisplay(): boolean {
    return this.notification_name.length > 0 && this.notification_description.length > 0;
  }
}

export default NotificationType;
