/* eslint-disable import/no-import-module-exports */

import { Model } from 'sequelize';

export interface CommunityInterestsInterface {
    community_id: string;
    interest_id: string;
    created_at: Date;
}
export default (sequelize: any, DataTypes: any) => {
    class CommunityInterests
        extends Model<CommunityInterestsInterface>
        implements CommunityInterestsInterface {
        community_id: string;
        interest_id: string;
        created_at: Date;

        static associate(models: any): void {
            CommunityInterests.belongsTo(models.Interest);
            CommunityInterests.belongsTo(models.Community);
        }
    }
    CommunityInterests.init(
        {
            interest_id: {
                type: DataTypes.UUID,
                references: {
                    model: 'Interests',
                    key: 'id',
                },
                allowNull: false,
                primaryKey: true,
            },

            community_id: {
                type: DataTypes.UUID,
                references: {
                    model: 'Communities',
                    key: 'id',
                },
                allowNull: false,
                primaryKey: true,
            },


            created_at: {
                type: DataTypes.DATE,
                defaultValue: new Date(),
            }
        },

        {
            sequelize,
            modelName: 'CommunityInterests',
            tableName: 'community_interests',
            underscored: true,
            updatedAt: false,
        }
    );
    return CommunityInterests;
};
