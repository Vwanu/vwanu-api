import { Table, Column, Model, DataType, TableOptions, PrimaryKey } from 'sequelize-typescript';
import { CommunityRoleType } from '../types/enums';

export interface CommunityRoleInterface {
  name: string;
  roleAccessLever: CommunityRoleType;
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
    type: DataType.ENUM(...Object.values(CommunityRoleType)),
    allowNull: false,
    defaultValue: CommunityRoleType.MEMBER,
    field: 'roleAccessLever',
  })
  roleAccessLever!: string
  
}
