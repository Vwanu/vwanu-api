/* eslint-disable no-param-reassign */
import { Model } from 'sequelize';
import { Id } from '@feathersjs/feathers';

export interface ConversationUsersInterface {
  conversationId: Id;
  userId: Id;
}
export default (sequelize: any, DataTypes: any) => {
  class ConversationUsers
    extends Model<ConversationUsersInterface>
    implements ConversationUsersInterface {
    conversationId: Id;
    userId: Id;

    // static associate(models: any): void {
    //   ConversationUsers.belongsTo(models.User, {
    //     through: 'ConversationUsers_Users',
    //   });

    // }
  }
  ConversationUsers.init(
    {
      conversationId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        references: {
          model: 'conversations',
          key: 'id',
        },
      },
      userId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },


    },

    {
      hooks: {},
      sequelize,
      modelName: 'ConversationUsers',
      tableName: 'conversation_users',
      underscored: true,
      updatedAt: false,
    }
  );
  return ConversationUsers;
};
