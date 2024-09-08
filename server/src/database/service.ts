import { Id } from '@feathersjs/feathers'
import { Model } from 'sequelize';

export interface ServiceInterface {
  id: Id;
  name: string;
}
export default (sequelize: any, DataTypes: any) => {
  class Service extends Model<ServiceInterface> implements ServiceInterface {
    id: Id;
    name: string;

    // static associate(models: any): void { }
  }
  Service.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'Service',
      tableName: 'services',
      underscored: true,
    }
  );
  return Service;
};
