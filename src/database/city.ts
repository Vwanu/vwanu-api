import { Table, Column, Model, DataType, PrimaryKey, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { State } from './state';

export interface CityInterface {
  id: string;
  name: string;
  stateId: string;
}

@Table({
  modelName: 'City',
})
export class City extends Model<CityInterface> implements CityInterface {
  
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

  @ForeignKey(() => State)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'state_id',
  })
  stateId!: string;

  // Associations
  @BelongsTo(() => State, 'stateId')
  state!: State;

  // Instance methods
  public getFullName(): string {
    return `${this.name}, ${this.state?.name || 'Unknown State'}`;
  }

  public getFullLocation(): string {
    if (!this.state?.country) {
      return this.getFullName();
    }
    return `${this.name}, ${this.state.name}, ${this.state.country.name}`;
  }
}
