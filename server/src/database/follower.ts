/* eslint-disable no-param-reassign */
/* eslint-disable import/no-import-module-exports */

import { Id } from '@feathersjs/feathers';
import { Model } from 'sequelize';

export interface FollowerInterface {
  user_id: Id;
  follower_id: Id;
}
export default (sequelize: any, DataTypes: any) => {
  class Follower extends Model<FollowerInterface> implements FollowerInterface {
    user_id: Id;
    follower_id: Id;
  }
  Follower.init(
    {

      user_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      follower_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },

    },

    {
      sequelize,
      modelName: 'Followers',
      tableName: 'followers',
      underscored: true,
      updatedAt: false,
    }
  );
  return Follower;
};
