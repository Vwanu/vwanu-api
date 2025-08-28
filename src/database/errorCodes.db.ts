import { Table, Column, Model, DataType, PrimaryKey, AllowNull, Unique, TableOptions } from 'sequelize-typescript';

export interface ErrorCodeInterface {
  error_code: string;
  error_message: string;
  description: string;
}

@Table({
  modelName: 'ErrorCodes',
  tableName: 'error_codes',
  underscored: true,
} as TableOptions<ErrorCode>)
export class ErrorCode extends Model<ErrorCodeInterface> implements ErrorCodeInterface {
  @PrimaryKey
  @AllowNull(false)
  @Unique
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 50],
    },
  })
  error_code!: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 500],
    },
  })
  error_message!: string;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 1000],
    },
  })
  description!: string;
}

export default ErrorCode;
