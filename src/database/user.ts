
import { Table, Column, Model, DataType } from 'sequelize-typescript';

import { UpUserInterface as UserInterface } from '../schema/user';

export const authorizationEnums = ['public', 'private', 'friend'];

@Table
({
  modelName: 'User',
})
export class User extends Model<UserInterface> {

  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id: string;
  // @Column({
  //   type: DataType.STRING,
  //   allowNull: true,
  //   defaultValue: 'user',
  //   validate: {
  //     customValidator(value) {
  //       if (!['user', 'admin', 'moderator'].includes(value)) {
  //         throw new Error(`${value} is not a valid option for user role`);
  //       }
  //     },
  //   },
  // })
  // role: string;
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      customValidator(value) {
        if (!value.includes('@')) {
          throw new Error(`${value} is not a valid email address`);
        }
      },
    },
  })
  email: string;
  
  @Column({ 
      type: DataType.INTEGER,
      defaultValue: 0,
      allowNull: false,
  })
  amountOfFollower: string;
  @Column({ 
      type: DataType.INTEGER,
      defaultValue: 0,
      allowNull: false,
  })
  amountOfFollowing: number;
    @Column({ 
      type: DataType.INTEGER,
      defaultValue: 0,
      allowNull: false,
  })
  amountOfFriend: number;
  @Column({
    type:DataType.DATE,
    allowNull: true,
  })
  birthday: Date;
  @Column({
      type: DataType.STRING,
      allowNull: true,
      defaultValue: 'Not specified'
  })
  lastName: string;
    @Column({
      type: DataType.STRING,
      allowNull: true,
      defaultValue: 'Not specified'
  })
  firstName:string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: 'Not specified',
    validate: {
      customValidator(value) {
        if (!['f', 'm', 'Not specified'].includes(value)) {
          throw new Error(`${value} is not a valid option for gender`);
        }
      },
    },
  })  
  gender: string;
  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: 'Not specified',
  })
  about: string;
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  verified: boolean;
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  active: boolean;
  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: 'Not specified',
  })
  nextCompletionStep: string;
  @Column({
     type: DataType.STRING,
        allowNull: true,
        defaultValue:
          'https://images.unsplash.com/photo-1528464884105-28166ef8edd0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
  })
  profilePicture: string;

  @Column({
   type: DataType.STRING,
  allowNull: true,
  defaultValue: 'Not specified'
      })
  search_vector: string;

      // static associate(models: any) {
    //   User.hasMany(models.Post, {
    //     onDelete: 'CASCADE',
    //   });
    //   User.hasMany(models.UserWorkPlace, {
    //     foreignKey: {
    //       name: 'UserId',
    //       allowNull: false,
    //     },
    //   });
    //   User.hasMany(models.Discussion, {
    //     onDelete: 'CASCADE',
    //   });
    //   User.hasMany(models.Message, {
    //     onDelete: 'CASCADE',
    //   });
    //   User.hasMany(models.Call, {
    //     onDelete: 'CASCADE',
    //   });

    //   User.hasMany(models.Interest);
    //   User.hasMany(models.Blog, {
    //     onDelete: 'CASCADE',
    //   });
    //   User.belongsToMany(models.Address, {
    //     through: 'EntityAddress',
    //     as: 'addresses',
    //   });
    //   User.belongsToMany(models.User, {
    //     as: 'Follower',
    //     through: 'User_Follower',
    //     onDelete: 'CASCADE',
    //   });

    //   // User.hasMany(models.User, { as: 'friends' });
    //   User.belongsToMany(models.User, {
    //     through: 'User_friends',
    //     as: 'friends',
    //     onDelete: 'CASCADE',
    //   });
    //   User.belongsToMany(models.User, {
    //     through: 'User_friends_request',
    //     as: 'friendsRequest',
    //     onDelete: 'CASCADE',
    //   });

    //   User.belongsToMany(models.Community, {
    //     through: 'CommunityUsers',
    //     onDelete: 'CASCADE',
    //   });

    //   User.belongsToMany(models.User, {
    //     through: 'User_friends_undesired',
    //     as: 'undesiredFriends',
    //     onDelete: 'CASCADE',
    //   });

    //   // User.belongsToMany(models.User, {
    //   //   through: 'User_visitors',
    //   //   as: 'Visitor',
    //   //   constraints: false,
    //   //   unique: false,
    //   // });

    //   // User.belongsToMany(models.User, {
    //   //   as: 'follower',
    //   //   through: models.UserFollower,
    //   // });
    //   // User.belongsToMany(models.User, {
    //   //   as: 'followed',
    //   //   through: models.UserFollower,
    //   // });
    // }

};

