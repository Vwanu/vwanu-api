import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { CognitoIdTokenPayload } from 'aws-jwt-verify/jwt-model';
import { BadRequest } from '@feathersjs/errors';

import Logger from './utils/logger';



export class CognitoService {
  private accessVerifier; 
  private idVerifier;

  constructor(private userPoolId: string, private clientId: string) {
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

  }

  async verifyTokens(accessToken: string, idToken: string) {
    try {
      if (!accessToken.startsWith('Bearer ')) {
        throw new BadRequest('Invalid access token format');
      }

      const accessPayload = await this.accessVerifier.verify(
        accessToken.split(' ')[1]
      );
      const idPayload = await this.idVerifier.verify(idToken);

      return {
        accessPayload,
        idPayload,
      };
    } catch (error: unknown ) {
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
}


