
import { Table, Column, DataType, PrimaryKey, AllowNull, Model, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user';
import Place from './places';
import Addres from './address';

export interface UserWorkPlaceInterface {
  position: string;
  description?: string;
  from: Date;
  to?: Date;
}
@Table({
  modelName: 'UserWorkPlace',
})
export class UserWorkPlace extends Model<UserWorkPlaceInterface> implements UserWorkPlaceInterface {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'UserId',
  })
  UserId!: string;

  @ForeignKey(() => Place)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'workPlace_id',
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
  @BelongsTo(() => Addres, 'addressId')
  address!: Addres;
  
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

