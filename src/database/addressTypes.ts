import { Table, Column, Model, DataType, PrimaryKey, AllowNull, Unique, Default, TableOptions } from 'sequelize-typescript';

export interface AddressTypeInterface {
  id: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Table({
  modelName: 'AddressTypes',
  tableName: 'addressTypes',
  underscored: true,
} as TableOptions<AddressType>)
export class AddressType extends Model<AddressTypeInterface> implements AddressTypeInterface {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
  id!: string;

  @Unique
  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      isIn: {
        args: [['Work', 'Home', 'Billing', 'Shipping', 'School', 'Other']],
        msg: 'Description must be one of: Work, Home, Billing, Shipping, School, Other',
      },
    },
  })
  description!: string;

  // Instance methods for better encapsulation
  public getDescription(): string {
    return this.description;
  }

  public getId(): string {
    return this.id;
  }

  public isWorkAddress(): boolean {
    return this.description === 'Work';
  }

  public isHomeAddress(): boolean {
    return this.description === 'Home';
  }

  public isBillingAddress(): boolean {
    return this.description === 'Billing';
  }

  public isShippingAddress(): boolean {
    return this.description === 'Shipping';
  }

  public isSchoolAddress(): boolean {
    return this.description === 'School';
  }

  public isOtherAddress(): boolean {
    return this.description === 'Other';
  }

  public getDisplayName(): string {
    return this.description;
  }

  public static getValidTypes(): string[] {
    return ['Work', 'Home', 'Billing', 'Shipping', 'School', 'Other'];
  }

  public static isValidType(type: string): boolean {
    return this.getValidTypes().includes(type);
  }
}

export default AddressType;
