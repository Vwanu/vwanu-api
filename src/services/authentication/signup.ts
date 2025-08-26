
import  { Response, Request } from 'express';
import { BadRequest } from '@feathersjs/errors';

import helper from '../../lib/utils/common';
import { Application } from '../../declarations';
import { User as UserModel } from '../../database/user';
import { AuthManager } from '../../lib/authManagement.class';
import { createUserSchema, CreateUserInput } from '../../schema/user';
import AppError from '../../errors';

export type SignupInput = CreateUserInput['body'];

// signup service
export default  (app: Application) => helper.catchAsync(
    async (req: Request<any, any, SignupInput>, res: Response<SignupInput>) => {
        console.log("user", req.body);
  const parsed = createUserSchema.safeParse({ body: {...req.body, birthdate: '1990-01-01'} });
  if (!parsed.success) {
    const firstIssueMessage = parsed.error.issues?.[0]?.message;
    throw new BadRequest(firstIssueMessage || 'Invalid request body');
  }
  const user = parsed.data.body;
  console.log("user", user);
  const authManager = AuthManager.getInstance();
  if (!process.env.userPoolId || !process.env.clientId) {
    throw new Error('Cognito configuration is not set');
  }
  authManager.initialize({
    userPoolId: process.env.userPoolId,
    clientId: process.env.clientId,
  });

  try {
  const cognitoResult = await authManager.createCognitoUser(user);
  const response = await app.service('users').create({
    ...user,
    birthdate:'1990-01-01',
    id: cognitoResult.UserSub,
  } as Partial<UserModel> & Record<string, unknown>);

  res.status(201).json(response);
} catch (error: unknown) {
    if(error instanceof Error) {
        if(error.name === 'UsernameExistsException') {
            throw new BadRequest(':( User already exists');
        }
        console.log(error)
        throw new AppError(error.message, 500, 'authentication.ts');
    }
    if(error instanceof Error && error.name === 'UsernameExistsException') {
        throw new BadRequest(':( User already exists');
    }
    console.log(error)
   throw new AppError((error as Error)?.message || 'An unknown error occurred', 500, 'authentication.ts');
}
});



