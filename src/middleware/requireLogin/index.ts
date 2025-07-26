import { Response, Request, NextFunction } from 'express';
import { Forbidden, GeneralError } from '@feathersjs/errors';

import AppError from '@root/errors';
import helper from '@root/lib/utils/common';
import { AuthManager } from '../../lib/authManagement.class';

export default helper.catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!process.env.userPoolId || !process.env.clientId) {
      throw new GeneralError('Cognito configuration is not set');
    }
    const authManager = AuthManager.getInstance();

    authManager.initialize({
      userPoolId: process.env.userPoolId,
      clientId: process.env.clientId,
    });

    const authToken = req.headers.authorization;

    const idToken = req.headers['x-id-token'];

    if (!authToken || !idToken) {
      throw new Forbidden('Missing Authentication token');
    }

    try {
      const userDetails = await authManager.getUserDetails(
        authToken,
        idToken as string,
      );
      (<any>req).user = userDetails;
      // console.log('req.user', req.user);
      (req as any).feathers = {
        cognitoUser: userDetails,
        User: { id: userDetails.id },
        params: {
          ...(req as any).feathers?.params,
          cognitoUser: userDetails,
          User: userDetails,
        },
      };

      return next();
    } catch (e: unknown | AppError) {
      if (e instanceof AppError) return next(e);
      throw e;
    }
  },
);
