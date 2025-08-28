import { Model } from 'sequelize';
import { Table, Column, DataType, PrimaryKey, AllowNull, Unique, TableOptions } from 'sequelize-typescript';

export interface PlaceInterface {
  id: string;
  name: string;
  addressId: string;
}

@Table({
  modelName: 'Places',
  tableName: 'workplaces',
  underscored: true,
} as TableOptions<Place>)
export class Place extends Model<PlaceInterface> implements PlaceInterface {
  @PrimaryKey
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id!: string;

  @Unique
  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 200], // Place name between 1-200 characters
    },
  })
  name!: string;

  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'addressId',
    validate: {
      notEmpty: true,
      isUUID: 4, // Ensure it's a valid UUID v4
    },
  })
  addressId!: string;

  // Instance methods for better encapsulation
  public getName(): string {
    return this.name;
  }

  public getId(): string {
    return this.id;
  }

  public getDisplayName(): string {
    return this.name.trim();
  }

  public hasAddress(): boolean {
    return !!this.addressId && this.addressId.length > 0;
  }

  public getAddressId(): string {
    return this.addressId;
  }

  public setAddress(addressId: string): void {
    if (!addressId || addressId.trim().length === 0) {
      throw new Error('Address ID is required for place');
    }
    this.addressId = addressId;
  }

  public isValidAddress(): boolean {
    return this.hasAddress() && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(this.addressId);
  }
}

export default Place;
