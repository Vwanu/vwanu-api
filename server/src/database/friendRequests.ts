/* eslint-disable no-param-reassign */
/* eslint-disable import/no-import-module-exports */

import { Id } from '@feathersjs/feathers';
import { Model } from 'sequelize';

export interface FriendRequestInterface {
  requester_id: Id;
  receiver_id: Id;
}
export default (sequelize: any, DataTypes: any) => {
  class FriendRequest extends Model<FriendRequestInterface> implements FriendRequestInterface {
    requester_id: Id;
    receiver_id: Id;

    static associate(models: any) {


      FriendRequest.hasMany(models.User, {
        as: 'requester',
        foreignKey: 'requester_id',
        onDelete: 'CASCADE',
      });
      // FriendRequest.hasMany(models.User, {
      //   as: 'receiver',
      //   foreignKey: 'receiver_id',
      //   onDelete: 'CASCADE',
      // });

      
    }
  }
  FriendRequest.init(
    {

      requester_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      receiver_id: {
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
      modelName: 'FriendRequests',
      tableName: 'friend_requests',
      underscored: true,
    }
  );
  return FriendRequest;
};
