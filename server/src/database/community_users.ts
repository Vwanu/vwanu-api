/* eslint-disable import/no-import-module-exports */

import { Model } from 'sequelize';

export interface CommunityUsersInterface {
    user_id: string;
    community_id: string;
    community_role_id: string;
    created_at: Date;
}
export default (sequelize: any, DataTypes: any) => {
    class CommunityUsers
        extends Model<CommunityUsersInterface>
        implements CommunityUsersInterface {
        user_id!: string;
        community_id: string;
        community_role_id: string;
        created_at: Date;

        static associate(models: any): void {
            CommunityUsers.belongsTo(models.User);
            CommunityUsers.belongsTo(models.Community);
            CommunityUsers.belongsTo(models.CommunityRoles);
        }
    }
    CommunityUsers.init(
        {
            user_id: {
                type: DataTypes.UUID,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                allowNull: false,
            },

            community_id: {
                type: DataTypes.UUID,
                references: {
                    model: 'Communities',
                    key: 'id',
                },
                allowNull: false,
            },

            community_role_id: {
                type: DataTypes.UUID,
                references: {
                    model: 'CommunityRoles',
                    key: 'id',
                },
                allowNull: false,
            },
            created_at: ''
        },

        {
            sequelize,
            modelName: 'CommunityUsers',
            tableName: 'community_users',
            underscored: true,
            updatedAt: false,
        }
    );
    return CommunityUsers;
};
