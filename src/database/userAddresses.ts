import { Table, Column, Model, DataType, PrimaryKey, AllowNull, Default } from 'sequelize-typescript';

export interface EntityAddressInterface {
  id: string;
  userId: number;
  addressId: string;
  addressTypeId: string;
  dateAddressTo?: Date;
  dateAddressFrom: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

@Table({
  modelName: 'EntityAddress',
})
export class EntityAddress extends Model<EntityAddressInterface> implements EntityAddressInterface {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
  id!: string;

  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'userId',
  })
  userId!: number;

  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'addressId',
  })
  addressId!: string;

  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'addressTypeId',
  })
  addressTypeId!: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  dateAddressTo?: Date;

  @Default(DataType.NOW)
  @AllowNull(false)
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  dateAddressFrom!: Date;

  // Instance methods for better encapsulation
  public getUserId(): number {
    return this.userId;
  }

  public getAddressId(): string {
    return this.addressId;
  }

  public getAddressTypeId(): string {
    return this.addressTypeId;
  }

  public getDateFrom(): Date {
    return this.dateAddressFrom;
  }

  public getDateTo(): Date | undefined {
    return this.dateAddressTo;
  }

  public isCurrentAddress(): boolean {
    return !this.dateAddressTo || this.dateAddressTo > new Date();
  }

  public isPastAddress(): boolean {
    return !!this.dateAddressTo && this.dateAddressTo <= new Date();
  }

  public getDuration(): number | null {
    if (!this.dateAddressTo) return null; // Still current
    const startTime = this.dateAddressFrom.getTime();
    const endTime = this.dateAddressTo.getTime();
    return Math.floor((endTime - startTime) / (1000 * 60 * 60 * 24)); // Days
  }

  public setEndDate(endDate: Date): void {
    this.dateAddressTo = endDate;
  }

  public markAsCurrent(): void {
    this.dateAddressTo = undefined;
  }

  public getAddressData(): EntityAddressInterface {
    return {
      id: this.id,
      userId: this.userId,
      addressId: this.addressId,
      addressTypeId: this.addressTypeId,
      dateAddressTo: this.dateAddressTo,
      dateAddressFrom: this.dateAddressFrom,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public isValidDateRange(): boolean {
    if (!this.dateAddressTo) return true; // Current address is always valid
    return this.dateAddressFrom <= this.dateAddressTo;
  }
}

export default EntityAddress;
