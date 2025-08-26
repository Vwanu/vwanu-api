import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { CognitoIdTokenPayload } from 'aws-jwt-verify/jwt-model';
import { BadRequest } from '@feathersjs/errors';
import {
  AdminUpdateUserAttributesCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
  AttributeType,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import {CreateUserInput} from '../schema/user'


import Logger from './utils/logger';

export type SignUpParams = CreateUserInput['body']


export class CognitoService {
  private accessVerifier;
  private idVerifier;
  private cognitoClient;

  constructor(
    private userPoolId: string,
    private clientId: string,
  ) {
    this.accessVerifier = CognitoJwtVerifier.create({
      userPoolId: this.userPoolId,
      tokenUse: 'access',
      clientId: this.clientId,
    });

    this.idVerifier = CognitoJwtVerifier.create({
      userPoolId: this.userPoolId,
      tokenUse: 'id',
      clientId: this.clientId,
    });
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: this.resolveRegion(),
    });
  }

  private resolveRegion(): string {
    const envRegion = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || process.env.COGNITO_REGION;
    if (envRegion && envRegion.trim().length > 0) {
      return envRegion;
    }
    // Try to extract from pool id (e.g., us-east-1_XXXX)
    if (this.userPoolId && this.userPoolId.includes('_')) {
      const candidate = this.userPoolId.split('_')[0];
      if (candidate && candidate.includes('-')) {
        return candidate;
      }
    }
    // Safe default
    return 'us-east-1';
  }

  async verifyTokens(accessToken: string, idToken: string) {
    try {
      if (!accessToken.startsWith('Bearer ')) {
        throw new BadRequest('Invalid access token format');
      }

      const accessPayload = await this.accessVerifier.verify(
        accessToken.split(' ')[1],
      );
      const idPayload = await this.idVerifier.verify(idToken);

      return {
        accessPayload,
        idPayload,
      };
    } catch (error: unknown) {
      Logger.error('Token verification failed:', error);
      throw new Error('Token verification failed');
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getUserDetails(idPayload: CognitoIdTokenPayload) {
    return {
      username: idPayload.username as string,
      emailVerified: idPayload.email_verified as boolean,
      firstName: idPayload.given_name as string,
      lastName: idPayload.family_name as string,
      email: idPayload.email as string,
      id: idPayload.sub,
    };
  }
  async updatUserAttributes(attributes: any) {
    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: this.userPoolId,
      Username: attributes.Username,
      UserAttributes: attributes.UserAttributes,
    });
    const response = await this.cognitoClient.send(command);
    return response;
  }

  async signUp(params: SignUpParams) {
  
  const { email, password, firstName, lastName, birthdate, gender } = params;
  const userAttributes: AttributeType[] = [
    { Name: 'email', Value: email },
    { Name: 'given_name', Value: firstName },
    { Name: 'family_name', Value: lastName },
    {Name: 'gender', Value:gender},
    {Name: 'birthdate', Value: birthdate.toISOString().split('T')[0]}
  ];

  const signUpCmd = new SignUpCommand({
    ClientId: this.clientId,
    Username: email,
    Password: password,
    UserAttributes: userAttributes,
  });
  const signUpResponse = await this.cognitoClient.send(signUpCmd);
  return signUpResponse;
}


  async createUser(params: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    const { email, password, firstName, lastName } = params;
    const userAttributes: AttributeType[] = [
      { Name: 'email', Value: email },
      { Name: 'email_verified', Value: 'true' },
    ];
    if (firstName) userAttributes.push({ Name: 'given_name', Value: firstName });
    if (lastName) userAttributes.push({ Name: 'family_name', Value: lastName });

    const createCmd = new AdminCreateUserCommand({
      UserPoolId: this.userPoolId,
      Username: email,
      TemporaryPassword: password,
      UserAttributes: userAttributes,
      MessageAction: 'SUPPRESS',
    });
    const createResponse = await this.cognitoClient.send(createCmd);

    const setPasswordCmd = new AdminSetUserPasswordCommand({
      UserPoolId: this.userPoolId,
      Username: email,
      Password: password,
      Permanent: true,
    });
    await this.cognitoClient.send(setPasswordCmd);

    return createResponse;
  }
}
