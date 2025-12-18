import { Table, Column, Model, DataType, PrimaryKey, AllowNull, ForeignKey, BelongsTo, UpdatedAt, TableOptions, BeforeCreate, BeforeUpdate } from 'sequelize-typescript';
import { User } from './user';
import { Community } from './communities';
import {CommunityRole} from './communityRole.model'


export interface CommunityJoinRequestInterface {
  id: string;
  response?: boolean;
  responseDate?: Date; // Optional in interface, but will always be set by Sequelize
  guestId: string; // User being invited (required - no email storage for privacy)
  isAutoApproved: boolean;
  approverId?: string | null; // Required when isAutoApproved is false, null when isAutoApproved is true
  communityId: string;
  communityRoleId: string;
}

@Table({
  modelName: 'CommunityJoinRequest',
  tableName: 'community_join_requests',
  // Note: responseDate serves as the updatedAt timestamp for better semantic clarity
  underscored: true,
} as TableOptions<CommunityJoinRequest>)
export class CommunityJoinRequest extends Model<CommunityJoinRequestInterface>   {

  @PrimaryKey
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  response?: boolean;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'guest_id',
  })
  guestId!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_auto_approved',
  })
  isAutoApproved!: boolean;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'approver_id',
  })
  approverId?: string | null;

  @ForeignKey(() => Community)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'community_id',
  })
  communityId!: string;

  @ForeignKey(()=>CommunityRole)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'community_role_id',
  })
  communityRoleId!: string

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  responseDate!: Date;

  // Validation hooks to enforce mutual exclusivity between isAutoApproved and approverId
  @BeforeCreate
  @BeforeUpdate
  static validateApproverConstraint(instance: CommunityJoinRequest) {
    // If auto-approved, approverId must be null
    if (instance.isAutoApproved && instance.approverId !== null && instance.approverId !== undefined) {
      throw new Error('approverId must be null when isAutoApproved is true');
    }

    // If there's an approver, isAutoApproved must be false
    if (instance.approverId && instance.isAutoApproved) {
      throw new Error('isAutoApproved must be false when approverId is provided');
    }

    // If not auto-approved and no approver, require an approver
    if (!instance.isAutoApproved && !instance.approverId) {
      throw new Error('approverId is required when isAutoApproved is false');
    }
  }

  // Associations
  @BelongsTo(() => User, 'guestId')
  guest!: User;

  @BelongsTo(() => User, 'approverId')
  approver?: User;

  @BelongsTo(() => Community, 'communityId')
  community!: Community;

  @BelongsTo(()=> CommunityRole, 'communityRoleId')
  communityRole!: CommunityRole



  // Instance methods for better encapsulation
  public isPending(): boolean {
    return this.response === null || this.response === undefined;
  }

  public isAccepted(): boolean {
    return this.response === true;
  }

  public isRejected(): boolean {
    return this.response === false;
  }

  public accept(): void {
    this.response = true;
    // responseDate will be automatically set by Sequelize via @UpdatedAt
  }

  public reject(): void {
    this.response = false;
    // responseDate will be automatically set by Sequelize via @UpdatedAt
  }

  public getStatus(): 'pending' | 'accepted' | 'rejected' {
    if (this.isAccepted()) return 'accepted';
    if (this.isRejected()) return 'rejected';
    return 'pending';
  }

  public getResponseDate(): Date | null {
    // If there's a response, return the responseDate timestamp
    return this.response !== null && this.response !== undefined ? this.responseDate : null;
  }

  public getTimeSinceResponse(): number | null {
    const responseDate = this.getResponseDate();
    return responseDate ? Date.now() - responseDate.getTime() : null;
  }

  public getTimeSinceResponseInDays(): number | null {
    const timeSinceResponse = this.getTimeSinceResponse();
    return timeSinceResponse ? Math.floor(timeSinceResponse / (1000 * 60 * 60 * 24)) : null;
  }

  public getTimeSinceInvitation(): number {
    return Date.now() - this.createdAt.getTime();
  }

  public getTimeSinceInvitationInDays(): number {
    return Math.floor(this.getTimeSinceInvitation() / (1000 * 60 * 60 * 24));
  }

  public isExpired(daysToExpire = 7): boolean {
    return this.getTimeSinceInvitationInDays() > daysToExpire;
  }


  public canGuestAccept(): boolean {
    return this.isPending() && !this.isExpired();
  }

  public getApproverName(): string {
    return this.approver ? `${this.approver.firstName} ${this.approver.lastName}` : 'Unknown User';
  }

  public getCommunityName(): string {
    return this.community?.name || 'Unknown Community';
  }


  public isFromSameApprover(approverId: string): boolean {
    return this.approverId === approverId;
  }

  public isForSameCommunity(communityId: string): boolean {
    return this.communityId === communityId;
  }

  public canBeReplaced(): boolean {
    return this.isPending() || this.isRejected();
  }
}
