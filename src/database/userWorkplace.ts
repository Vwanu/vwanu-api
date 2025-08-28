
import { Table, Column, DataType, AllowNull, Model, ForeignKey, BelongsTo, TableOptions } from 'sequelize-typescript';
import { User } from './user';
import Place from './places';

export interface UserWorkPlaceInterface {
  position: string;
  description?: string;
  from: Date;
  to?: Date;
}
@Table({
  modelName: 'UserWorkPlace',
  tableName: 'user_workplaces',
  underscored: true,
} as TableOptions<UserWorkPlace>)
export class UserWorkPlace extends Model<UserWorkPlaceInterface> implements UserWorkPlaceInterface {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  UserId!: string;

  @ForeignKey(() => Place)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'place_id',
  })
  WorkPlaceId!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  position: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  from: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  to?: Date;

  @BelongsTo(() => User, 'UserId')
  user!: User;

  @BelongsTo(() => Place, 'WorkPlaceId')
  workPlace!: Place;

  // Instance methods
  public isCurrentJob(): boolean {
    return !this.to || this.to > new Date();
  }

  public getDuration(): number | null {
    if (!this.from) return null;
    const endDate = this.to || new Date();
    return Math.floor((endDate.getTime() - this.from.getTime()) / (1000 * 60 * 60 * 24 * 365.25)); // Years
  }

  public getDescription(): string {
    return this.description || '';
  }
}

