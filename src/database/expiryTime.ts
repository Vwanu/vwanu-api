import { Table, Column, Model, DataType, PrimaryKey, AllowNull } from 'sequelize-typescript';

export interface ExpiryTimeInterface {
  request_type: string;
  expiry_duration_minutes: number;
}

@Table({
  modelName: 'ExpiryTimes',
})
export class ExpiryTime extends Model<ExpiryTimeInterface> implements ExpiryTimeInterface {
  @PrimaryKey
  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100], // Request type length between 1-100 characters
    },
  })
  request_type!: string;

  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1, // At least 1 minute
      max: 525600, // Maximum 1 year in minutes
    },
  })
  expiry_duration_minutes!: number;

  // Instance methods for better encapsulation
  public getExpiryDurationInHours(): number {
    return Math.round(this.expiry_duration_minutes / 60 * 100) / 100; // Round to 2 decimal places
  }

  public getExpiryDurationInDays(): number {
    return Math.round(this.expiry_duration_minutes / (60 * 24) * 100) / 100; // Round to 2 decimal places
  }

  public isLongTerm(): boolean {
    return this.expiry_duration_minutes > (24 * 60); // More than 24 hours
  }

  public getRequestType(): string {
    return this.request_type;
  }

  public getExpiryMinutes(): number {
    return this.expiry_duration_minutes;
  }
}

export default ExpiryTime;
