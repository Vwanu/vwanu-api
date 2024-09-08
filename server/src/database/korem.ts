/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
/* eslint-disable import/no-import-module-exports */
import { Model } from 'sequelize';
import { Id } from '@feathersjs/feathers';

export interface KoremInterface {
  id: Id;
  entityId: Id;
}
export default (sequelize: any, DataTypes: any) => {
  class Korem extends Model<KoremInterface> implements KoremInterface {
    id: Id;
    entityId: Id;

    static associate(models: any): void {
      Korem.belongsTo(models.User);
      Korem.belongsTo(models.Service);
    }
  }
  Korem.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },

      entityId: {
        type: DataTypes.UUID,
        allowNull: false,
        // references: {
        //   model: 'services',
        //   key: 'id',
        // },
      },


    },
    {
      sequelize,
      modelName: 'Korem',
      tableName: 'korems',
      underscored: true,
      updatedAt: false,
    }
  );
  return Korem;
};
