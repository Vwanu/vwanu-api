/* eslint-disable import/no-import-module-exports */
import { nanoid } from 'nanoid';
import { Model } from 'sequelize';

// Custom imports

import { UpUserInterface as UserInterface } from '../schema/user';

export const authorizationEnums = ['public', 'private', 'friend'];
export default (sequelize: any, DataTypes: any) => {
  class User extends Model<UserInterface> implements UserInterface {
    id: string;
    profilePrivacy: string;
    about: string;
    email: string;
    gender: string;
    lastSeen: Date;
    active: boolean;
    online: boolean;
    birthday: string;
    lastName: string;
    firstName: string;
    resetExpires: Date;
    access_role: string;
    resetAttempts: number;
    loginAttempts: number;
    search_vector: string;
    relationshipId: string;
    backgroundImage: string;
    password: string | undefined;
    activationKey?: string | null;
    verified?: boolean | undefined;
    coverPicture: string | undefined;
    profilePicture: string | undefined;
    resetPasswordKey?: string | undefined;
    resetShortPasswordKey?: string | undefined;

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

      // User.hasMany(models.Interest);
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
      User.hasMany(models.FriendRequests, {
        as: 'requester',
        foreignKey: 'requester_id',
        onDelete: 'CASCADE',
      });

      User.hasMany(models.FriendRequests, {
        as: 'receiver',
        foreignKey: 'receiver_id',
        onDelete: 'CASCADE',
      });
      // User.belongsToMany(models.User, {
      //   through: 'FriendRequests',
      //   foreignKey: 'requester_id',
      //   otherKey: 'receiver_id',
      //   as: 'friendsRequest',
      //   onDelete: 'CASCADE',
      // });

      User.belongsToMany(models.Community, {
        through: 'CommunityUsers',
        onDelete: 'CASCADE',
      });

      User.belongsToMany(models.User, {
        through: 'UndesiredFriends',
        foreignKey: 'user_id',
        otherKey: 'undesired_user_id',
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
      access_role: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'CommunityRoles',
          key: 'id',
        }
      },
      profilePrivacy: {
        type: DataTypes.STRING,
        defaultValue: 'public',
        validate: {
          customValidator: (value) => {
            if (!authorizationEnums.includes(value)) {
              throw new Error(
                `${value} is not a valid option for profilePrivacy`
              );
            }
          },
        },
      },
      // resetAttempts: {
      //   type: DataTypes.INTEGER,
      //   allowNull: true,
      // },
      // loginAttempts: {
      //   type: DataTypes.INTEGER,
      //   allowNull: true,
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
      // active_status: {
      //   type: DataTypes.BOOLEAN,
      //   defaultValue: false,
      // },
      birthday: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      password: {
        type: DataTypes.STRING,
        allowNull: false,
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
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,

        // validate: {
        //   customValidator: (value) => {
        //     if (!['f', 'm', 'Not specified'].includes(value)) {
        //       throw new Error(`${value} is not a valid option for gender`);
        //     }
        //   },
        // },
      },
      about: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      activationKey: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: () => nanoid(),
      },
      resetPasswordKey: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      // emailPrivacy: {
      //   type: DataTypes.BOOLEAN,
      //   defaultValue: false,
      // },
      // phonePrivacy: {
      //   type: DataTypes.BOOLEAN,
      //   defaultValue: false,
      // },

      // active: {
      //   type: DataTypes.BOOLEAN,
      //   defaultValue: true,
      // },

      online: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      lastSeen: {
        type: DataTypes.DATE,
        defaultValue: new Date(),
      },

      // resetExpires: {
      //   type: DataTypes.DATE,
      //   allowNull: true,
      // },

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
      // website: {
      //   type: DataTypes.STRING,
      //   allowNull: true,
      // },
      search_vector: {
        type: DataTypes.TSVECTOR,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
      timestamps: true,
    }
  );
  return User;
};


/*discord: string;
    facebook: string;
    profilePrivacy: string;
    followPrivacy: string;
    friendPrivacy: string;
    phonePrivacy: boolean;
    friendListPrivacy: string;
    emailPrivacy: boolean;
    google: string;
    instagram: string;
    linkedin: string;
    language: string;
    lastSeenPrivacy: boolean;
    mailru: string;
    messagePrivacy: string;
    postPrivacy: string;
    qq: string;
    twitter: string;
    username?: string | undefined;
    vk: string;
    tiktok: string;
       school: string;
       wechat: string;

    website: string;

    working: string;

    workingLink: string;

    youtube: string;

    showLastSeen: boolean;

    eVisitedNotified: boolean;

    youtubePrivacy: boolean;

    linkedinPrivacy: boolean;

    twitterPrivacy: boolean;

    faceBookPrivacy: boolean;

    instagramPrivacy: boolean;




    discord: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },

      friendPrivacy: {
        type: DataTypes.STRING,
        defaultValue: 'public',
        validate: {
          customValidator: (value) => {
            if (!authorizationEnums.includes(value)) {
              throw new Error(
                `${value} is not a valid option for friendPrivacy`
              );
            }
          },
        },
      },
      friendListPrivacy: {
        type: DataTypes.STRING,
        defaultValue: 'public',
        validate: {
          customValidator: (value) => {
            if (!authorizationEnums.includes(value)) {
              throw new Error(
                `${value} is not a valid option for friendListPrivacy`
              );
            }
          },
        },
      },


       youtubePrivacy: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      linkedinPrivacy: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      twitterPrivacy: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      faceBookPrivacy: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      instagramPrivacy: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      followPrivacy: {
        type: DataTypes.STRING,
        defaultValue: 'public',
        validate: {
          customValidator: (value) => {
            if (!authorizationEnums.includes(value)) {
              throw new Error(
                `${value} is not a valid option for followPrivacy`
              );
            }
          },
        },
      },
      profilePrivacy: {
        type: DataTypes.STRING,
        defaultValue: 'public',
        validate: {
          customValidator: (value) => {
            if (!authorizationEnums.includes(value)) {
              throw new Error(
                `${value} is not a valid option for profilePrivacy`
              );
            }
          },
        },
      },

      wechat: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      facebook: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },

      tiktok: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      mailru: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },

      qq: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },

      vk: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },

      instagram: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },

      youtube: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },

      linkedin: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      twitter: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },

      relationshipId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      avatar: { type: DataTypes.STRING, allowNull: true, unique: true },
      username: { type: DataTypes.STRING, allowNull: true, unique: true },

      google: {
        type: DataTypes.STRING,
        allowNull: true,
      },

        country: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      eVisitedNotified: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
        language: {
        type: DataTypes.STRING,
        defaultValue: 'en',
      },
      showLastSeen: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      lastSeenPrivacy: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
*/