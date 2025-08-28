import { Table, Column, Model, DataType, PrimaryKey, AllowNull, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Country } from './country';
import { City } from './city';

export interface StateInterface {
  id: string;
  name: string;
  areaCode?: string;
  initials?: string;
  countryId: string;
}

// @ts-ignore
@Table({
  modelName: 'state',
  tableName: 'states',
  timestamps: false,
  underscored: true,
})
export class State extends Model<StateInterface> implements StateInterface {
  
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id!: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  initials?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'area_code',
  })
  areaCode?: string;

  @ForeignKey(() => Country)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'country_id',
  })
  countryId!: string;


  // Associations
  @BelongsTo(() => Country, 'countryId')
  country!: Country;

  @HasMany(() => City)
  cities!: City[];

  // Instance methods
  public getDisplayName(): string {
    return this.initials ? `${this.name} (${this.initials})` : this.name;
  }

  public getFullName(): string {
    return `${this.name}, ${this.country?.name || 'Unknown Country'}`;
  }
}
