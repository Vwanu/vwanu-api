/* eslint-disable import/no-import-module-exports */

import { Model } from 'sequelize';
import { Id } from '@feathersjs/feathers'

export interface CityInterface {
  id: Id;
  name: string;
}
export default (sequelize: any, DataTypes: any) => {
  class City extends Model<CityInterface> implements CityInterface {
    id: Id;
    name: string;

    static associate(models: any): void {
      City.belongsTo(models.State);
    }
  }
  City.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
    },

    {
      // hooks: {
      //   afterFind: (name, option) => {
      //     // console.log('\n\n\n Some thing ');
      //     // console.log({name, option});
      //   },
      // },
      sequelize,
      modelName: 'City',
      tableName: 'cities',
      timestamps: true,
      createdAt: false,
      updatedAt: false,
      underscored: true,
    }
  );
  return City;
};
