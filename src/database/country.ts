import { Table, Column, Model, DataType, PrimaryKey, AllowNull, Unique, HasMany, TableOptions } from 'sequelize-typescript';
import { State } from './state';

export interface CountryInterface {
  id: string;
  name: string;
  initials?: string;
}

@Table({
  modelName: 'country',
  tableName: 'countries',
  underscored: true,
} as TableOptions<Country>)
export class Country extends Model<CountryInterface> implements CountryInterface {
  
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id!: string;

  @AllowNull(false)
  @Unique
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

  // Associations
  @HasMany(() => State)
  states!: State[];

  // Instance methods
  public getDisplayName(): string {
    return this.initials ? `${this.name} (${this.initials})` : this.name;
  }
}
