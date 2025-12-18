import { Table, Column, Model, DataType, TableOptions, PrimaryKey } from 'sequelize-typescript';

export interface CommunityRoleInterface {
  name: string;
  roleAccessLevel: number;
}

@Table({
  modelName: 'CommunityRoles',
  tableName: 'community_roles',
  underscored: true,
} as TableOptions<CommunityRole>)

export class CommunityRole extends Model<CommunityRoleInterface>  {
   @PrimaryKey
   @Column({
      type: DataType.UUID,
      primaryKey: true,
      defaultValue: DataType.UUIDV4, // Auto-generate UUID
      allowNull: false,
      field: 'id',
   })
   id:string;
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'name',
  })
  name!: string;
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 2, // 0=admin, 1=moderator, 2=member
    field: 'role_access_level',
  })
  roleAccessLevel!: number
  
}
