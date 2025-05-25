/* eslint-disable import/no-import-module-exports */
/* eslint-disable @typescript-eslint/no-var-requires */

const { Model } = require('sequelize');
import { TemplateMessageInterface } from '../schema/templateMessage.schema';

export default (sequelize: any, DataTypes: any) => {
  class TemplateMessage extends Model<TemplateMessageInterface> {
    declare snug: string;
    declare template_body: string;
    declare required_fields: JSON;
  }
  TemplateMessage.init(
    {
      snug: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      template_body: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,

      },
      required_fields: {
        type: DataTypes.JSON,
        allowNull: false
      }
      
    },

    {

      sequelize,
      modelName: 'TemplateMessages',
      underscored: true,
      tableName: 'template_messages',
      timestamps: false 
    }
  );
  return TemplateMessage;
};
