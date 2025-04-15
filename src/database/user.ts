/* eslint-disable import/no-import-module-exports */
import { Model } from 'sequelize';

// Custom imports

import { UpUserInterface as UserInterface } from '../schema/user';

export const authorizationEnums = ['public', 'private', 'friend'];
export default (sequelize: any, DataTypes: any) => {
  class User extends Model<UserInterface> {
    static associate(models: any) {
      User.hasMany(models.Post, {
        onDelete: 'CASCADE',
      });
      User.hasMany(models.UserWorkPlace, {
        foreignKey: {
          name: 'UserId',
          allowNull: false,
        },
      });
      User.hasMany(models.Discussion, {
        onDelete: 'CASCADE',
      });
      User.hasMany(models.Message, {
        onDelete: 'CASCADE',
      });
      User.hasMany(models.Call, {
        onDelete: 'CASCADE',
      });

      User.hasMany(models.Interest);
      User.hasMany(models.Blog, {
        onDelete: 'CASCADE',
      });
      User.belongsToMany(models.Address, {
        through: 'EntityAddress',
        as: 'addresses',
      });
      User.belongsToMany(models.User, {
        as: 'Follower',
        through: 'User_Follower',
        onDelete: 'CASCADE',
      });

      // User.hasMany(models.User, { as: 'friends' });
      User.belongsToMany(models.User, {
        through: 'User_friends',
        as: 'friends',
        onDelete: 'CASCADE',
      });
      User.belongsToMany(models.User, {
        through: 'User_friends_request',
        as: 'friendsRequest',
        onDelete: 'CASCADE',
      });

      User.belongsToMany(models.Community, {
        through: 'CommunityUsers',
        onDelete: 'CASCADE',
      });

      User.belongsToMany(models.User, {
        through: 'User_friends_undesired',
        as: 'undesiredFriends',
        onDelete: 'CASCADE',
      });

      // User.belongsToMany(models.User, {
      //   through: 'User_visitors',
      //   as: 'Visitor',
      //   constraints: false,
      //   unique: false,
      // });

      // User.belongsToMany(models.User, {
      //   as: 'follower',
      //   through: models.UserFollower,
      // });
      // User.belongsToMany(models.User, {
      //   as: 'followed',
      //   through: models.UserFollower,
      // });
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      // role_access_level: {
      //   type: DataTypes.UUID,
      //   allowNull: true,
      //   references: {
      //     model: 'CommunityRoles',
      //     key: 'id',
      //   },
      // },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        // @ts-ignore
        level: 'C',
      },
      amountOfFollower: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      amountOfFollowing: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      amountOfFriend: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      birthday: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      backgroundImage: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },

      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        // @ts-ignore
        level: 'B',
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        // @ts-ignore
        level: 'A',
      },
      gender: {
        type: DataTypes.STRING,
        defaultValue: 'Not specified',
        validate: {
          customValidator: (value) => {
            if (!['f', 'm', 'Not specified'].includes(value)) {
              throw new Error(`${value} is not a valid option for gender`);
            }
          },
        },
      },

      about: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      coverPicture: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue:
          'https://images.unsplash.com/photo-1528464884105-28166ef8edd0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
      },
      profilePicture: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue:
          'https://images.unsplash.com/photo-1528464884105-28166ef8edd0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
      },

      search_vector: {
        type: DataTypes.TSVECTOR,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
    }
  );
  return User;
};
