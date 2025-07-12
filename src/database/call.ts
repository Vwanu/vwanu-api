/* eslint-disable no-param-reassign */
import {Table, Column, Model, BelongsTo, ForeignKey, DataType} from 'sequelize-typescript';
import {User} from './user'; // Assuming User model is defined in user.ts
import { CallStatus, CallType } from '../types/enums';
// Customs dependencies:
import { CallInterface } from '../schema/call';

@Table({
  modelName: 'Call',
})
export class Call extends Model<CallInterface> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id!: string;

  @Column({ 
    type: DataType.DATE, 
    allowNull: true 
  })
  startTime!: number;

  @Column({ 
    type: DataType.DATE, 
    allowNull: true 
  })
  endTime!: number;

  @Column({
    type: DataType.ENUM(...Object.values(CallStatus)),
    defaultValue: CallStatus.INITIATED,
    allowNull: false,
  })
  status!: CallStatus;

  @Column({
    type: DataType.ENUM(...Object.values(CallType)),
    allowNull: false,
  })
  type!: CallType;

  // Relationships with proper typing
  @ForeignKey(() => User)
  @Column
  callerId!: number;

  @BelongsTo(() => User, 'callerId')
  caller!: User;

  @ForeignKey(() => User)
  @Column
  receiverId!: number;

  @BelongsTo(() => User, 'receiverId')
  receiver!: User;

} 
