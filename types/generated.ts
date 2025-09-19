/**
 * Auto-generated TypeScript types from Zod schemas
 * Generated on: 2025-09-19T20:25:44.537Z
 *
 * DO NOT EDIT MANUALLY - This file is generated automatically
 * Run 'npm run generate-types' to regenerate
 */

// ============================================================================
// Types from user_notifications_types.ts
// ============================================================================

export interface UserNotificationTypesInterface {
  id: number;
  email: string;
}

export interface CreateNotificationTypesInput {
  id: number;
  email: string;
}

// ============================================================================
// Types from user_notifications_settings.ts
// ============================================================================

export interface UserNotificationSettingsInterface {
  id: number;
}

export interface CreateuserNotificationSettingsSchemarInput {
  id: number;
}

// ============================================================================
// Types from user.ts
// ============================================================================

export interface UserInterface {
  id: number;
  email: string;
  verified: boolean;
}

export interface UpUserInterface {
  id: number;
  email: string;
}

export interface CreateUserInput {
  id: number;
  email: string;
}

export interface GetUserInput {
  id: number;
  email: string;
}

export interface addOrRemoveFriendInput {
  id: number;
  email: string;
}

// ============================================================================
// Types from transactionalEmailTypes.schema.ts
// ============================================================================

export type TR_EMAILS_LIST = 
  "resetPwd" | "VerifySignup" | "sendResetPwd" | "passwordChange" | "identityChange" | "activationConfirmation";

export type TR_EMAILS_TYPES = 
  "resetPwd" | "verifySignup" | "sendResetPwd" | "passwordChange" | "identityChange" | "resendVerifySignup";

// ============================================================================
// Types from templateMessage.schema.ts
// ============================================================================

export interface TemplateMessageInterface { [key: string]: any }

// ============================================================================
// Types from smtpconfiguration.schema.ts
// ============================================================================

export interface SMTP_CONFIGURATION { [key: string]: any }

// ============================================================================
// Types from serverConf.schema.ts
// ============================================================================

export interface DBConfigurationType {
  name: string;
}

export interface ApiConfigurationType {
  name: string;
}

// ============================================================================
// Types from request.ts
// ============================================================================

export interface MulterRequest extends Request {
  files: any;
}

// ============================================================================
// Types from reaction.schema.ts
// ============================================================================

export interface createPostReactionInput {
  body: any;
  PostId: any;
  required_error: any;
}

export interface createReactionInput {
  body: any;
  name: string;
  required_error: any;
}

export interface getReactionInput {
  params: any;
  id: any;
  required_error: any;
}

export interface editReactionInput {
  params: any;
  id: any;
  required_error: any;
}

// ============================================================================
// Types from profile.ts
// ============================================================================

export interface CreateProfileInput {
  id: number;
}

export interface ProfileInterface {
  id: number;
}

// ============================================================================
// Types from post.ts
// ============================================================================

export interface PostInterface {
  id: number;
  media: string;
  mediaType: string;
  postText: string;
  hashTag: string;
  private: boolean;
}

export interface CreatePostInterface {
  id: number;
}

export interface CreatePostInput {
  id: number;
}

export interface CreateCommentInput {
  id: number;
}

export interface editCommentInput {
  id: number;
}

export interface editPostInput {
  id: number;
}

export interface getOnePostInput {
  id: number;
}

// ============================================================================
// Types from phoneNumbers.schema.ts
// ============================================================================

export interface PhoneInterface {
  id: number;
}

// ============================================================================
// Types from notifier.ts
// ============================================================================

export type viaType = 
  "mail" | "sms" | "mobilePushNotification" | "webPushNotification";

export interface NotifierOptions { [key: string]: any }

// ============================================================================
// Types from notifications_types.ts
// ============================================================================

export interface NotificationTypesInterface {
  name: string;
}

// ============================================================================
// Types from messageTemplate.ts
// ============================================================================

export interface getEmailTemplateInput {
  id: number;
}

export interface MessageTemplateInterface {
  id: number;
}

// ============================================================================
// Types from mediaConf.schema.ts
// ============================================================================

export interface MEDIA_CONFIG_TYPE {
  name: string;
}

export interface CLOUDINARY_CONFIG_TYPE {
  name: string;
}

// ============================================================================
// Types from htmlEmails.ts
// ============================================================================

export interface EmailTemplateInterface {
  id: number;
  name: string;
}

export interface CreateEmailTemplateInput {
  id: number;
  name: string;
}

// ============================================================================
// Types from expiryTime.schema.ts
// ============================================================================

export interface ExpiryTimeInterface { [key: string]: any }

// ============================================================================
// Types from errorCode.schema.ts
// ============================================================================

export interface ErrorCodeInterface { [key: string]: any }

// ============================================================================
// Types from email.schema.ts
// ============================================================================

export interface IMessenger {
  send: any;
  ok: boolean;
}

export interface SendEmailType {
  to: string;
  subject: string;
  html: string;
}

export interface SendEmailTemplateType {
  to: string;
  subject: string;
  templateId: string;
  personalizations: any[];
  dynamic_template_data: any;
}

// ============================================================================
// Types from call.ts
// ============================================================================

export interface CallInterface {
  id: string;
  startTime: number;
  endTime: number;
  status: string;
  type: string;
}

// ============================================================================
// Types from UserPhoneVerifications.schema.ts
// ============================================================================

export interface UserPhoneVerificationsInterface {
  id: number;
}

// ============================================================================
// Types from MsgTemplate.schema.ts
// ============================================================================

export interface MsgTemplate {
  body: string;
  subject: string;
  type: any;
  snug: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  skip: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  skip?: number;
}

export type ID = string | number;

export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  url?: string;
}

// Common API input/output types
export interface BaseQueryParams {
  include?: string[];
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export interface DateRange {
  startDate?: Date | string;
  endDate?: Date | string;
}
