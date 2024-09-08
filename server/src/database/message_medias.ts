/* eslint-disable import/no-import-module-exports */

import { Model } from 'sequelize';
import { Id } from '@feathersjs/feathers';

export interface MessageMediasInterface {
    message_id: Id;
    media_id: Id;
}
export default (sequelize: any, DataTypes: any) => {
    class MessageMedias
        extends Model<MessageMediasInterface>
        implements MessageMediasInterface {
        message_id: Id;
        media_id: Id;

        static associate(models: any): void {
            MessageMedias.belongsTo(models.Interest);
            MessageMedias.belongsTo(models.Community);
        }
    }
    MessageMedias.init(
        {
            message_id: {
                type: DataTypes.UUID,
                references: {
                    model: 'messages',
                    key: 'id',
                },
                allowNull: false,
                primaryKey: true,
            },

            media_id: {
                type: DataTypes.UUID,
                references: {
                    model: 'medias',
                    key: 'id',
                },
                allowNull: false,
                primaryKey: true,
            },
        },

        {
            sequelize,
            modelName: 'MessageMedias',
            tableName: 'message_medias',
            underscored: true,
        }
    );
    return MessageMedias;
};
