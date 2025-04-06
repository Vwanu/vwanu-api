/* eslint-disable import/prefer-default-export */
import { Forbidden } from '@feathersjs/errors';
import { HookContext } from '@feathersjs/feathers';
import { CognitoService } from './cognito.service';

interface CognitoConfig {
  userPoolId: string;
  clientId: string;
}

class AuthManager {
  // eslint-disable-next-line no-use-before-define
  private static instance: AuthManager;
  private cognitoService: CognitoService | null = null;
  private config: CognitoConfig | null = null;

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  public initialize(config: CognitoConfig): void {
    if (!this.cognitoService) {
      this.config = config;
      this.cognitoService = new CognitoService(
        config.userPoolId,
        config.clientId
      );
    }
  }

  public requireAuth = async (context: HookContext): Promise<HookContext> => {
    if (!this.cognitoService || !this.config) {
      throw new Error('AuthManager must be initialized with config before use');
    }

    try {
      const authHeader = context.params?.headers?.authorization;
      const idToken = context.params?.headers?.['x-id-token'];

      if (!authHeader || !idToken) {
        throw new Forbidden('Missing required tokens');
      }

      const tokens = await this.cognitoService.verifyTokens(
        authHeader,
        idToken
      );
      if (tokens) {
        const { idPayload } = tokens;
        const userDetails = this.cognitoService.getUserDetails(idPayload);
        context.params.cognitoUser = userDetails;
      }
    } catch (error) {
      throw new Forbidden('Invalid authentication tokens');
    }
    return context;
  };
}

export const authManager = AuthManager.getInstance();

// For backward compatibility and easier migration
export const requireAuth = (config: CognitoConfig) => {
  authManager.initialize(config);
  return authManager.requireAuth;
};
