import { Table, Column, Model, DataType, PrimaryKey, AllowNull, TableOptions } from 'sequelize-typescript';

export interface VisitorInterface {
  id: number;
  userId: number;
  visitorId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

@Table({
  modelName: 'Visitor',
  tableName: 'visitors',
  underscored: true,
} as TableOptions<Visitor>)
export class Visitor extends Model<VisitorInterface> implements VisitorInterface {
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;

  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'userId',
  })
  userId!: number;

  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'visitorId',
  })
  visitorId!: number;

  // Instance methods for better encapsulation
  public getUserId(): number {
    return this.userId;
  }

  public getVisitorId(): number {
    return this.visitorId;
  }

  public getVisitedAt(): Date | undefined {
    return this.createdAt;
  }

  public isRecentVisit(hoursAgo = 24): boolean {
    if (!this.createdAt) return false;
    const hoursAgoMs = hoursAgo * 60 * 60 * 1000;
    return (Date.now() - this.createdAt.getTime()) < hoursAgoMs;
  }

  public isSameUser(): boolean {
    return this.userId === this.visitorId;
  }

  public getVisitData(): VisitorInterface {
    return {
      id: this.id,
      userId: this.userId,
      visitorId: this.visitorId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export default Visitor;
