/* eslint-disable no-param-reassign */
/* eslint-disable import/no-import-module-exports */

import { Id } from '@feathersjs/feathers';
import { Model } from 'sequelize';

export interface UndesiredFriendInterface {
  user_id: Id;
  undesired_user_id: Id;
}
export default (sequelize: any, DataTypes: any) => {
  class UndesiredFriend extends Model<UndesiredFriendInterface> implements UndesiredFriendInterface {
    user_id: Id;
    undesired_user_id: Id;
  }
  UndesiredFriend.init(
    {

      user_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      undesired_user_id: {
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
      modelName: 'UndesiredFriends',
      tableName: 'undesired_friends',
      underscored: true,
    }
  );
  return UndesiredFriend;
};
