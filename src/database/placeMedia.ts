import { Table, Column, Model, DataType, AllowNull, TableOptions } from 'sequelize-typescript';

export interface PlaceMediaInterface {
  PlaceId: string;
  MediaId: string;
  displayOrder?: number;
  caption?: string;
  isPrimary?: boolean;
}

@Table({
  modelName: 'PlaceMedia',
    tableName: 'place_media',
  underscored: true,
} as TableOptions<PlaceMedia>)
export class PlaceMedia extends Model<PlaceMediaInterface> implements PlaceMediaInterface {
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'PlaceId',
  })
  PlaceId!: string;

  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'MediaId',
  })
  MediaId!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  })
  displayOrder?: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  caption?: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  })
  isPrimary?: boolean;

  // Instance methods
  public getDisplayOrder(): number {
    return this.displayOrder || 0;
  }

  public getCaption(): string {
    return this.caption || '';
  }

  public isMainMedia(): boolean {
    return this.isPrimary === true;
  }

  public setAsPrimary(): void {
    this.isPrimary = true;
  }

  public setAsSecondary(): void {
    this.isPrimary = false;
  }

  public setDisplayOrder(order: number): void {
    if (order < 0) {
      throw new Error('Display order must be non-negative');
    }
    this.displayOrder = order;
  }

  public setCaption(caption: string): void {
    this.caption = caption;
  }
}

export default PlaceMedia;
