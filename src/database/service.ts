import { Table, Column, Model, DataType, PrimaryKey, AllowNull, Unique } from 'sequelize-typescript';

export interface ServiceInterface {
  id: string;
  name: string;
}

@Table({
  modelName: 'Service',
})
export class Service extends Model<ServiceInterface> implements ServiceInterface {
  
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id!: string;

  @Unique
  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  // Instance methods for better encapsulation
  public getDisplayName(): string {
    return this.name;
  }

  public getSlug(): string {
    return this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  public isActive(): boolean {
    return true; // Services are assumed to be active by default
  }

  public matches(searchTerm: string): boolean {
    return this.name.toLowerCase().includes(searchTerm.toLowerCase());
  }

  public getServiceData(): ServiceInterface {
    return {
      id: this.id,
      name: this.name,
    };
  }
}
