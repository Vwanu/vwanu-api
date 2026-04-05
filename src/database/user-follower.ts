import { Table, Column, Model, DataType, ForeignKey, PrimaryKey, TableOptions } from 'sequelize-typescript';
import { User } from './user';

export interface UserFollowerInterface {
  userId: string;
  followerId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Table({
  modelName: 'UserFollower',
  tableName: 'followers',
  underscored: true,
} as TableOptions<UserFollower>)
export class UserFollower extends Model<UserFollowerInterface> implements UserFollowerInterface {

  @PrimaryKey
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  userId!: string;

  @PrimaryKey
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'follower_id',
  })
  followerId!: string;
}
