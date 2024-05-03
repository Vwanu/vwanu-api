/* eslint-disable import/no-import-module-exports */
import { Model } from 'sequelize';

// Custom imports

import { UserPhoneVerificationsInterface } from '../schema/UserPhoneVerifications.schema';
import { nanoid } from 'nanoid';

export default (sequelize: any, DataTypes: any) => {
  class UserPhoneVerifications extends Model<PhoneInterface> implements PhoneInterface {
    user_id:string
    phone_id :string
    verification_code: number
    code_sent_time: string
    verified_time:string
    is_verified :boolean

    // static associate(models: any) {
    //   PhoneNumbers.belongsToMany(models.Users, {
    //     through:"phone_verifications",
    //     onDelete: 'CASCADE',
    //   });
    // }
  }
  UserPhoneVerifications.init(
    {
      user_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      phone_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      verification_code: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue:nanoid(),
      },
      code_sent_time: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue:Date.now(),
      },
      verified_time: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_verified:{
        type:DataTypes.BOOLEAN,
        defaultValue:false,
        allowNull:false, 
      }

      
    },
    {
      sequelize,
      modelName: 'PhoneNumbers',
      tableName:'phone_numbers',
      underscored:true,

    }
  );
  return UserPhoneVerifications  ;
};
