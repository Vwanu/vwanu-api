import { Forbidden, GeneralError } from '@feathersjs/errors';
import { CognitoService, SignUpParams } from './cognito.service';


interface CognitoConfig {
  userPoolId: string;
  clientId: string;
}

export class AuthManager {
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
  public createCognitoUser = async (params: SignUpParams) => {
    if (!this.cognitoService || !this.config) {
      throw new GeneralError('AuthManager must be initialized with config before use');
    }
    const response = await this.cognitoService.signUp(params);
    
    return response;
  }
  public getUserDetails = async (authToken:string, idToken:string) => {
    if (!this.cognitoService || !this.config) {
      throw new GeneralError('AuthManager must be initialized with config before use');
    }
    try{
      const tokens = await this.cognitoService.verifyTokens(authToken, idToken);
      if(!tokens){
        throw new Forbidden('Invalid authentication tokens');
      }
      const { idPayload } = tokens;
      const userDetails = this.cognitoService.getUserDetails(idPayload);
      return userDetails;
    }catch(error){
      throw new Forbidden('Invalid authentication tokens');
    }
  
  }

  
}


