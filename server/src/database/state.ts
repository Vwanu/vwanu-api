/* eslint-disable import/no-import-module-exports */
import { Id } from '@feathersjs/feathers';
import { Model } from 'sequelize';

export interface StateInterface {
  id: Id;
  name: string;
  code: string;
}
export default (sequelize: any, DataTypes: any) => {
  class State extends Model<StateInterface> implements StateInterface {
    id: Id;
    name: string;
    code: string;

    static associate(models: any): void {
      State.hasMany(models.City);
      State.belongsTo(models.Country, {
        foreignKey: { allowNull: false },
      });
    }
  }
  State.init(
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
      },
      code: {
        type: DataTypes.STRING,
        allowNull: true,
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
      modelName: 'State',
      tableName: 'states',
      underscored: true,
      createdAt: false,
      updatedAt: false,

    }
  );
  return State;
};
