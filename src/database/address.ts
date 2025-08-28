import { Table, Column, Model, DataType, PrimaryKey, AllowNull, ForeignKey, BelongsTo, TableOptions } from 'sequelize-typescript';
import { City } from './city';
import { State } from './state';
import { Country } from './country';

export interface AddressInterface {
  id: string;
  cityId: string;
  stateId: string;
  countryId: string;
}

@Table({
  modelName: 'Address',
  tableName: 'addresses',
  underscored: true,
} as TableOptions<Address>)
export class Address extends Model<AddressInterface> implements AddressInterface {
  
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id!: string;

  @ForeignKey(() => City)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'city_id',
  })
  cityId!: string;

  @ForeignKey(() => State)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'state_id',
  })
  stateId!: string;

  @ForeignKey(() => Country)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'country_id',
  })
  countryId!: string;

  // Associations
  @BelongsTo(() => City, 'cityId')
  city!: City;

  @BelongsTo(() => State, 'stateId')
  state!: State;

  @BelongsTo(() => Country, 'countryId')
  country!: Country;

  // HasMany association with EntityAddress - commented until that model is converted
  // @HasMany(() => EntityAddress, 'addressId')
  // entityAddresses?: EntityAddress[];

  // Instance methods for better encapsulation
  public getFullAddress(): string {
    return `${this.city?.name || ''}, ${this.state?.name || ''}, ${this.country?.name || ''}`.trim();
  }

  public getShortAddress(): string {
    return `${this.city?.name || ''}, ${this.country?.name || ''}`.trim();
  }

  public isInCountry(countryId: string): boolean {
    return this.countryId === countryId;
  }

  public isInState(stateId: string): boolean {
    return this.stateId === stateId;
  }

  public isInCity(cityId: string): boolean {
    return this.cityId === cityId;
  }

  public getLocationData(): { city?: string; state?: string; country?: string } {
    return {
      city: this.city?.name,
      state: this.state?.name,
      country: this.country?.name,
    };
  }
}
