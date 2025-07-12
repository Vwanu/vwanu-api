import { Table, Column, Model, DataType, PrimaryKey, AllowNull, ForeignKey, BelongsTo, UpdatedAt } from 'sequelize-typescript';
import { User } from './user';
import { Community } from './communities';
import { CommunityRoleType } from '../types/enums';

export interface CommunityInvitationRequestInterface {
  id: string;
  response?: boolean;
  responseDate?: Date; // Optional in interface, but will always be set by Sequelize
  guestId: string; // User being invited (required - no email storage for privacy)
  hostId: string; // User sending the invitation
  communityId: string;
  roleOffered: CommunityRoleType;
}

@Table({
  modelName: 'CommunityInvitationRequest',
  // Note: responseDate serves as the updatedAt timestamp for better semantic clarity
})
export class CommunityInvitationRequest extends Model<CommunityInvitationRequestInterface> implements CommunityInvitationRequestInterface {
  
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

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'host_id',
  })
  hostId!: string;

  @ForeignKey(() => Community)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'community_id',
  })
  communityId!: string;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(CommunityRoleType)),
    allowNull: false,
    defaultValue: CommunityRoleType.MEMBER,
    field: 'role_offered',
  })
  roleOffered!: CommunityRoleType;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'response_date',
  })
  responseDate!: Date;

  // Associations
  @BelongsTo(() => User, 'guestId')
  guest!: User;

  @BelongsTo(() => User, 'hostId')
  host!: User;

  @BelongsTo(() => Community, 'communityId')
  community!: Community;

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

  public getInvitationDescription(): string {
    const roleText = this.roleOffered.charAt(0).toUpperCase() + this.roleOffered.slice(1);
    const guestName = this.guest ? `${this.guest.firstName} ${this.guest.lastName}` : 'user';
    const status = this.getStatus();
    const statusText = status === 'pending' ? '' : ` (${status})`;
    return `Invitation to join as ${roleText} sent to ${guestName}${statusText}`;
  }

  public canGuestAccept(): boolean {
    return this.isPending() && !this.isExpired();
  }

  public getHostName(): string {
    return this.host ? `${this.host.firstName} ${this.host.lastName}` : 'Unknown User';
  }

  public getCommunityName(): string {
    return this.community?.name || 'Unknown Community';
  }

  public getFullInvitationText(): string {
    return `${this.getHostName()} invited you to join ${this.getCommunityName()} as ${this.roleOffered}`;
  }

  public isFromSameHost(hostId: string): boolean {
    return this.hostId === hostId;
  }

  public isForSameCommunity(communityId: string): boolean {
    return this.communityId === communityId;
  }

  public canBeReplaced(): boolean {
    return this.isPending() || this.isRejected();
  }
}
