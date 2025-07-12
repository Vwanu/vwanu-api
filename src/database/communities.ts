import { Table, Column, Model, DataType, ForeignKey , BelongsTo, BelongsToMany} from 'sequelize-typescript';
import { CommunityPrivacyType, CommunityPermissionLevel } from '../types/enums';
import { User } from './user';
// import { CommunityUsers } from './community-users';
// import { CommunityInvitationRequest } from './communityInvitationRequest';
import { Interest } from './interest'; // Assuming Interest model is defined in interest.ts

export interface CommunityInterface {
  id: string;
  name: string;
  coverPicture: string;
  description: string;
  search_vector: string;
  profilePicture: string;
  creatorId: string; // Renamed from UserId for clarity
  numMembers: number;
  numAdmins: number;
  privacyType: CommunityPrivacyType;
  canInvite: CommunityPermissionLevel;
  canPost: CommunityPermissionLevel; // Renamed from canInPost for clarity
  canMessageInGroup: CommunityPermissionLevel;
  haveDiscussionForum: boolean;

}

@Table({
  modelName: 'Community',
})

export class Community extends Model<CommunityInterface> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id!: string;

  @ForeignKey(() => User) 
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'creator_id', // Maps to snake_case DB column
  })
  creatorId!: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false,
    field: 'num_members',
  })
  numMembers!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false,
    field: 'num_admins',
  })
  numAdmins!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 100], // Name must be between 3-100 characters
      notEmpty: true,
    },
  })
  name!: string;

  @Column({
    type: DataType.ENUM(...Object.values(CommunityPrivacyType)),
    defaultValue: CommunityPrivacyType.PUBLIC,
    allowNull: false,
    field: 'privacy_type',
  })
  privacyType!: CommunityPrivacyType;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'cover_picture',
    validate: {
      isUrl: {
        msg: 'Cover picture must be a valid URL'
      }
    },
  })
  coverPicture!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    validate: {
      len: [10, 2000], // Description must be between 10-2000 characters
      notEmpty: true,
    },
  })
  description!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'profile_picture',
    validate: {
      isUrl: {
        msg: 'Profile picture must be a valid URL'
      }
    },
  })
  profilePicture!: string;

  @Column({
    type: DataType.ENUM(...Object.values(CommunityPermissionLevel)),
    defaultValue: CommunityPermissionLevel.ADMINS,
    allowNull: false,
    field: 'can_invite',
  })
  canInvite!: CommunityPermissionLevel;

  @Column({
    type: DataType.ENUM(...Object.values(CommunityPermissionLevel)),
    defaultValue: CommunityPermissionLevel.ADMINS,
    allowNull: false,
    field: 'can_post',
  })
  canPost!: CommunityPermissionLevel;

  @Column({
    type: DataType.ENUM(...Object.values(CommunityPermissionLevel)),
    defaultValue: CommunityPermissionLevel.ADMINS,
    allowNull: false,
    field: 'can_message_in_group',
  })
  canMessageInGroup!: CommunityPermissionLevel;


  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    field: 'have_discussion_forum',
  })
  haveDiscussionForum!: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'search_vector',
  })
  search_vector!: string;

  // Instance methods for better encapsulation
  public canUserInvite(userRole: CommunityPermissionLevel): boolean {
    const permissionHierarchy = {
      [CommunityPermissionLevel.ADMINS]: 1,
      [CommunityPermissionLevel.MODERATORS]: 2,
      [CommunityPermissionLevel.EVERYONE]: 3,
    };
    
    return permissionHierarchy[userRole] >= permissionHierarchy[this.canInvite];
  }

  public canUserPost(userRole: CommunityPermissionLevel): boolean {
    const permissionHierarchy = {
      [CommunityPermissionLevel.ADMINS]: 1,
      [CommunityPermissionLevel.MODERATORS]: 2,
      [CommunityPermissionLevel.EVERYONE]: 3,
    };
    
    return permissionHierarchy[userRole] >= permissionHierarchy[this.canPost];
  }

  public isPublic(): boolean {
    return this.privacyType === CommunityPrivacyType.PUBLIC;
  }

  public isPrivate(): boolean {
    return this.privacyType === CommunityPrivacyType.PRIVATE;
  }

  public isHidden(): boolean {
    return this.privacyType === CommunityPrivacyType.HIDDEN;
  }

  // Associations
  @BelongsTo(() => User, 'creatorId')
  creator!: User;
  
  @BelongsToMany(() => Interest, {
    through: 'community_interests',
    foreignKey: 'community_id',     // FK pointing to Community
    otherKey: 'interest_id',        // FK pointing to Interest
  })
  interests!: Interest[];
  
  // Note: For User-Community relationship, we use the explicit CommunityUsers model
  // because it has additional fields like role, joinedAt, etc.
  // @BelongsToMany(() => User, () => CommunityUsers)
  // members!: User[];
  
  // @HasMany(() => CommunityInvitationRequest, { foreignKey: 'communityId' })
  // invitationRequests!: CommunityInvitationRequest[];
  
  // @HasMany(() => CommunityUsers, { foreignKey: 'communityId' })
  // communityUsers!: CommunityUsers[];
}
