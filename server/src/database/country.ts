/* eslint-disable import/no-import-module-exports */

import { Model } from 'sequelize';
import { Id } from '@feathersjs/feathers';

export interface CountryInterface {
  id: Id;
  name: string;
}
export default (sequelize: any, DataTypes: any) => {
  class Country extends Model<CountryInterface> implements CountryInterface {
    id: Id;
    name: string;

    static associate(models: any): void {
      Country.hasMany(models.State);
    }
  }
  Country.init(
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
        unique: true,
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
      modelName: 'Country',
      tableName: 'countries',
      createdAt: false,
      updatedAt: false,
    }
  );
  return Country;
};
