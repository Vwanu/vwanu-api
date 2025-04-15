import { HookContext } from '@feathersjs/feathers';
import jwt from 'jsonwebtoken';

// Define custom payload interface to fix typescript errors
interface CognitoPayload {
  sub: string;
  username: string;
  email: string;
  given_name: string;
  family_name: string;
  email_verified: boolean;
  [key: string]: any;
}

// Mock implementation for testing
export class MockAuthManager {
  // eslint-disable-next-line no-use-before-define
  private static instance: MockAuthManager;
  private secret = 'test-secret-key-for-tests-only';
  private userMap = new Map<string, any>();

  public static getInstance(): MockAuthManager {
    if (!MockAuthManager.instance) {
      MockAuthManager.instance = new MockAuthManager();
    }
    return MockAuthManager.instance;
  }

  // eslint-disable-next-line class-methods-use-this
  public initialize(): void {
    // No-op for mock
  }

  public registerUser(user: any): { accessToken: string; idToken: string } {
    const payload: CognitoPayload = {
      sub: user.id,
      username: user.email,
      email: user.email,
      given_name: user.firstName || user.firstname,
      family_name: user.lastName || user.lastname,
      email_verified: true,
    };

    const accessToken = jwt.sign(payload, this.secret, { expiresIn: '1d' });
    const idToken = jwt.sign(payload, this.secret, { expiresIn: '1d' });

    this.userMap.set(user.id, {
      ...user,
      accessToken: `Bearer ${accessToken}`,
      idToken,
    });

    return {
      accessToken: `Bearer ${accessToken}`,
      idToken,
    };
  }

  public requireAuth = async (context: HookContext): Promise<HookContext> => {
    try {
      const authHeader = context.params?.headers?.authorization;
      const idToken = context.params?.headers?.['x-id-token'];

      if (!authHeader || !idToken) {
        throw new Error('Missing required tokens');
      }

      const accessToken = authHeader.replace('Bearer ', '');
      const accessPayload = jwt.verify(
        accessToken,
        this.secret
      ) as CognitoPayload;
      const idPayload = jwt.verify(idToken, this.secret) as CognitoPayload;

      if (accessPayload && idPayload) {
        context.params.cognitoUser = {
          username: idPayload.username,
          attributes: {
            sub: idPayload.sub,
            email: idPayload.email,
            given_name: idPayload.given_name,
            family_name: idPayload.family_name,
            email_verified: idPayload.email_verified,
          },
        };
      }
    } catch (error) {
      throw new Error('Invalid authentication tokens');
    }
    return context;
  };
}

export const mockAuthManager = MockAuthManager.getInstance();
