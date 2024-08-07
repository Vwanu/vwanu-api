/* eslint-disable no-param-reassign */
/* eslint-disable import/no-import-module-exports */

import { Id } from '@feathersjs/feathers';
import { Model } from 'sequelize';

export interface FriendRequestInterface {
  requester_id: Id;
  receiver_id: Id;
  accept: boolean;
  response_date: Date;
}
export default (sequelize: any, DataTypes: any) => {
  class FriendRequest extends Model<FriendRequestInterface> implements FriendRequestInterface {
    requester_id: Id;
    receiver_id: Id;
    accept: boolean;
    response_date: Date;

    static associate(models: any) {

      FriendRequest.belongsTo(models.User, {
        foreignKey: 'requester_id',
        onDelete: 'CASCADE',
      });


      // FriendRequest.hasMany(models.User, {
      //   as: 'requester',
      //   // foreignKey: 'requester_id',
      //   onDelete: 'CASCADE',
      // });
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

      accept: {
        type: DataTypes.BOOLEAN,
        allowNull: true,

      },
      response_date: {
        type: DataTypes.DATE,

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
